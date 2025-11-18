require('dotenv').config();
const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const ElevenLabsAgent = require('./services/elevenLabs');
const { supabase } = require('./services/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Health check endpoint (required for Railway/Render)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Colonial Call Service Backend',
    version: '1.0.0'
  });
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// WebSocket server for client connections
const wss = new WebSocketServer({ server });

// Track active connections
const activeConnections = new Map();

wss.on('connection', async (clientWs, req) => {
  // Extract call session ID from query params
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    console.error('❌ Connection rejected - missing session_id');
    clientWs.close(1008, 'Missing session_id parameter');
    return;
  }

  console.log(`📞 New call connection: ${sessionId}`);

  try {
    let session;
    let isTestSession = false;

    // Allow test sessions in development mode
    if (sessionId.startsWith('test-') && process.env.NODE_ENV === 'development') {
      console.log('⚡ Using test session (development mode)');
      isTestSession = true;
      session = {
        id: sessionId,
        product_type: 'superannuation',
        product_id: 'test-product-123',
        status: 'pending'
      };
    } else {
      // Get call session from database
      const { data: dbSession, error: sessionError } = await supabase
        .from('call_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError || !dbSession) {
        console.error('❌ Call session not found:', sessionId);
        clientWs.send(JSON.stringify({
          type: 'error',
          error_message: 'Call session not found'
        }));
        clientWs.close();
        return;
      }

      session = dbSession;
    }

    // Update session status to in_progress (skip for test sessions)
    if (!isTestSession) {
      await supabase
        .from('call_sessions')
        .update({
          status: 'in_progress',
          connected_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    }

    // Check if connection already exists (prevent duplicates)
    // This must happen BEFORE any async operations to prevent race conditions
    const existingConnection = activeConnections.get(sessionId);
    if (existingConnection) {
      console.warn(`⚠️ Duplicate connection detected for session: ${sessionId} - rejecting new connection`);
      
      // Close the NEW connection (reject it)
      clientWs.close(1008, 'Duplicate connection - session already active');
      
      // Keep the EXISTING connection active - don't delete it!
      // The first connection is still valid and should continue
      return;
    }

    // Reserve this session immediately to prevent race conditions
    activeConnections.set(sessionId, { 
      clientWs, 
      agent: null, 
      draftId: null,
      isTestSession,
      transcriptSequence: 0
    });

    // Create draft beneficiary record (skip for test sessions)
    let draft = null;
    if (!isTestSession) {
      const { data: draftData, error: draftError } = await supabase
        .from('draft_beneficiaries')
        .insert({
          call_session_id: sessionId,
          product_type: session.product_type,
          product_id: session.product_id,
          extraction_status: 'empty',
          field_extraction_metadata: {}
        })
        .select()
        .single();

      if (draftError) {
        console.error('❌ Failed to create draft:', draftError);
      } else {
        draft = draftData;
        console.log(`✅ Draft beneficiary created: ${draft.id}`);
      }
    } else {
      console.log('⚡ Skipping database operations for test session');
    }

    // Connect to 11Labs Conversational AI agent
    const agent = new ElevenLabsAgent(
      sessionId,
      // onMessage handler
      async (message) => {
        await handleAgentMessage(clientWs, sessionId, draft?.id, message, isTestSession);
      },
      // onError handler
      (error) => {
        console.error('11Labs agent error:', error.message);
        clientWs.send(JSON.stringify({
          type: 'error',
          error_message: 'Voice assistant error'
        }));
      },
      // onClose handler
      () => {
        console.log('11Labs agent disconnected');
      }
    );

    // Connect to 11Labs
    await agent.connect();

    // Update connection reference with agent and draft
    const connection = activeConnections.get(sessionId);
    if (connection) {
      connection.agent = agent;
      connection.draftId = draft?.id;
    }

    // Handle messages from client
    clientWs.on('message', async (data) => {
      try {
        // Try parsing as JSON (control messages)
        const message = JSON.parse(data.toString());
        await handleClientMessage(agent, sessionId, message, isTestSession);
      } catch {
        // Binary audio data with metadata header from frontend
        // Format: [metadata_length(4 bytes)][metadata JSON][raw audio]
        const buffer = Buffer.from(data);
        
        // Extract metadata length (first 4 bytes)
        const metadataLength = buffer.readUInt32LE(0);
        
        // Extract metadata JSON
        const metadataStart = 4;
        const metadataEnd = metadataStart + metadataLength;
        const metadataBytes = buffer.slice(metadataStart, metadataEnd);
        const metadata = JSON.parse(metadataBytes.toString());
        
        // Extract raw audio data (rest of the buffer)
        const audioData = buffer.slice(metadataEnd);
        
        // Send raw PCM audio directly to 11Labs (NOT JSON!)
        // 11Labs Conversational AI expects binary PCM frames
        agent.sendAudio(audioData);
      }
    });

    // Set up realtime listener for 2FA status changes (skip for test sessions)
    let twoFAChannel = null;
    if (!isTestSession) {
      twoFAChannel = supabase
        .channel(`twofa-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'call_sessions',
            filter: `id=eq.${sessionId}`
          },
          (payload) => {
            const updatedCall = payload.new;
            console.log(`🔐 2FA status changed to: ${updatedCall.twofa_status}`);
            
            if (updatedCall.twofa_status === 'confirmed') {
              // User confirmed 2FA - they will respond verbally to the agent
              // No need to send special message to 11Labs - agent handles conversation naturally
              console.log('✅ 2FA confirmed - user will respond verbally to agent');
            } else if (updatedCall.twofa_status === 'rejected') {
              // User rejected 2FA - end the call gracefully
              console.log('❌ 2FA rejected - ending call');
              
              // Close the client connection which will trigger cleanup
              clientWs.close(1000, '2FA rejected by user');
            }
          }
        )
        .subscribe();
      
      // Store channel reference for cleanup
      const connection = activeConnections.get(sessionId);
      if (connection) {
        connection.twoFAChannel = twoFAChannel;
      }
    }

    // Handle client disconnect
    clientWs.on('close', async () => {
      console.log(`🔌 Client disconnected: ${sessionId}`);
      
      // Clean up 2FA channel
      if (twoFAChannel) {
        await supabase.removeChannel(twoFAChannel);
      }
      
      // Check if connection was already cleaned up (e.g., by call_ended)
      const connection = activeConnections.get(sessionId);
      if (!connection) {
        console.log(`ℹ️ Connection already cleaned up: ${sessionId}`);
        return;
      }
      
      // Forcefully close 11Labs agent to prevent zombie connections
      console.log(`🛑 Force closing 11Labs agent for: ${sessionId}`);
      connection.agent.close();
      
      // Update session status (skip for test sessions)
      if (!isTestSession) {
        // Check if any data was collected before marking as completed/cancelled
        const { data: draftData } = await supabase
          .from('draft_beneficiaries')
          .select('id, full_name, relationship')
          .eq('call_session_id', sessionId)
          .maybeSingle();
        
        const hasData = draftData && (draftData.full_name || draftData.relationship);
        
        await supabase
          .from('call_sessions')
          .update({
            status: hasData ? 'completed' : 'cancelled',
            ended_at: new Date().toISOString(),
            final_action: hasData ? 'draft_saved' : 'cancelled'
          })
          .eq('id', sessionId);
        
        console.log(`📊 Client disconnected - Status: ${hasData ? 'completed (data saved)' : 'cancelled (no data)'}`);
      }

      // Remove from active connections
      activeConnections.delete(sessionId);
    });

    // Send connection success to client
    clientWs.send(JSON.stringify({
      type: 'status_change',
      new_status: 'connected',
      message: 'Connected to voice assistant',
      timestamp: Date.now()
    }));

  } catch (error) {
    console.error('❌ Error initializing call:', error);
    clientWs.send(JSON.stringify({
      type: 'error',
      error_message: 'Failed to initialize call'
    }));
    clientWs.close();
  }
});

/**
 * Handle control messages from client
 */
async function handleClientMessage(agent, sessionId, message, isTestSession = false) {
  console.log(`📨 Client message: ${message.type}`);

  switch (message.type) {
    case 'call_accepted':
      // Client accepted the call
      if (!isTestSession) {
        await supabase
          .from('call_sessions')
          .update({ status: 'in_progress' })
          .eq('id', sessionId);
      }
      break;

    case 'call_ended':
      // Client ended the call - close 11Labs immediately
      console.log(`🛑 Call ended by client: ${sessionId}`);
      
      if (!isTestSession) {
        // Check if any data was collected
        const { data: draftData } = await supabase
          .from('draft_beneficiaries')
          .select('id, full_name, relationship')
          .eq('call_session_id', sessionId)
          .maybeSingle();
        
        const hasData = draftData && (draftData.full_name || draftData.relationship);
        
        // If data was collected, mark as completed (success)
        // If no data, mark as cancelled
        await supabase
          .from('call_sessions')
          .update({
            status: hasData ? 'completed' : 'cancelled',
            ended_at: new Date().toISOString(),
            final_action: hasData ? 'draft_saved' : 'cancelled'
          })
          .eq('id', sessionId);
        
        console.log(`📊 Call ended by client - Status: ${hasData ? 'completed (data saved)' : 'cancelled (no data)'}`);
      }
      
      // Close 11Labs connection immediately
      agent.close();
      
      // Remove from active connections to prevent double close
      activeConnections.delete(sessionId);
      break;

    case 'ping':
      // Ignore ping messages - they're for WebSocket keepalive
      break;

    default:
      console.warn('Unknown message type from client:', message.type);
  }
}

/**
 * Handle messages from 11Labs agent
 */
async function handleAgentMessage(clientWs, sessionId, draftId, message, isTestSession = false) {
  switch (message.type) {
    case 'audio':
      // Forward AI voice audio to client
      if (message.audio_data) {
        try {
          // Ensure audio_data is a Buffer
          const audioBuffer = Buffer.isBuffer(message.audio_data) 
            ? message.audio_data 
            : Buffer.from(message.audio_data);
          
          const base64Audio = audioBuffer.toString('base64');
          console.log(`🔊 Sending ${audioBuffer.length} bytes audio to client`);
          
          clientWs.send(JSON.stringify({
            type: 'audio_stream',
            call_session_id: sessionId,
            audio_data: base64Audio,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('❌ Failed to process audio data:', error);
        }
      } else {
        console.warn('⚠️ Received audio message with no audio_data');
      }
      break;

    case 'user_transcript':
      // User's audio transcript from 11Labs
      if (message.user_transcription_event?.user_transcript) {
        const userText = message.user_transcription_event.user_transcript;
        
        // Save to database (skip for test sessions)
        if (!isTestSession) {
          const connection = activeConnections.get(sessionId);
          if (connection) {
            connection.transcriptSequence++;
            const { error } = await supabase
              .from('conversation_transcripts')
              .insert({
                call_session_id: sessionId,
                speaker: 'client',
                message_text: userText,
                timestamp: new Date().toISOString(),
                sequence_number: connection.transcriptSequence
              });
            
            if (error) {
              console.error('❌ Failed to save user transcript to DB:', error);
            }
            
            // Store the last user response for field extraction
            connection.lastUserResponse = userText;
          }
        }

        console.log(`💬 [client]: ${userText}`);
      }
      break;

    case 'agent_response':
      // Agent's text response from 11Labs
      if (message.agent_response_event?.agent_response) {
        const agentText = message.agent_response_event.agent_response;
        
        // Check if agent is requesting 2FA
        const is2FARequest = /two.?factor|2fa|verify your identity|notification on your device|approve.*device/i.test(agentText);
        
        if (is2FARequest && !isTestSession) {
          console.log('🔐 Agent requesting 2FA - triggering client notification');
          
          // Update call session to trigger 2FA notification on client
          await supabase
            .from('call_sessions')
            .update({ twofa_status: 'pending' })
            .eq('id', sessionId);
        }
        
        // SAVE AFTER AGENT MOVES TO NEXT QUESTION
        // Track what field the agent is currently asking for, then save when they move to the next
        if (!isTestSession && draftId) {
          const connection = activeConnections.get(sessionId);
          if (connection) {
            // Detect what field the agent is asking for
            const currentField = detectFieldFromQuestion(agentText);
            
            // If agent is asking a new question AND we have a previous field with user response
            if (currentField && connection.lastAskedField && connection.lastUserResponse) {
              // Save the field from the PREVIOUS question using the user's response
              const fieldToSave = extractSpecificField(connection.lastAskedField, connection.lastUserResponse);
              
              if (fieldToSave && Object.keys(fieldToSave).length > 0) {
                console.log(`💾 Saving ${connection.lastAskedField} after user answered:`, fieldToSave);
                const { error: saveError } = await supabase
                  .from('draft_beneficiaries')
                  .update({
                    ...fieldToSave,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', draftId);
                
                if (saveError) {
                  console.error('❌ Failed to save field:', saveError);
                } else {
                  console.log('✅ Field saved successfully');
                }
              }
              
              // Clear the user response after saving
              connection.lastUserResponse = null;
            }
            
            // Update the current field being asked
            if (currentField) {
              connection.lastAskedField = currentField;
            }
          }
        }
        
        // Update data collection status when first field is saved
        if (!isTestSession && draftId) {
          const connection = activeConnections.get(sessionId);
          if (connection && connection.lastAskedField) {
            // Update to in_progress when data collection starts
            await supabase
              .from('call_sessions')
              .update({ data_collection_status: 'in_progress' })
              .eq('id', sessionId)
              .eq('data_collection_status', 'not_started'); // Only update if still not_started
          }
        }
        
        // Check if agent is confirming final data collection
        const isDataConfirmation = /let me confirm what I've collected|confirm.*collected|here is the information/i.test(agentText);
        
        if (isDataConfirmation && !isTestSession && draftId) {
          console.log('📋 Agent confirming data - parsing beneficiary information');
          
          // Mark data collection as completed
          await supabase
            .from('call_sessions')
            .update({ data_collection_status: 'completed' })
            .eq('id', sessionId);
          
          // Parse beneficiary data from agent's confirmation message
          const beneficiaryData = parseBeneficiaryData(agentText);
          
          if (beneficiaryData.full_name) {
            console.log('💾 Saving beneficiary data (raw):', beneficiaryData);
            
            // Normalize data to match database formats
            const normalizedData = normalizeBeneficiaryData(beneficiaryData);
            console.log('🔄 Normalized data:', normalizedData);
            
            // Prepare update object with all collected fields
            const updateData = {
              updated_at: new Date().toISOString()
            };
            
            // Add all non-null fields to update (using correct DB column names)
            // Skip fields that failed normalization (returned null)
            if (normalizedData.full_name) updateData.full_name = normalizedData.full_name;
            if (normalizedData.relationship) updateData.relationship = normalizedData.relationship;
            if (normalizedData.date_of_birth !== null && normalizedData.date_of_birth !== undefined) {
              updateData.date_of_birth = normalizedData.date_of_birth;
            }
            if (normalizedData.email) updateData.email = normalizedData.email;
            if (normalizedData.phone) updateData.phone = normalizedData.phone;
            if (normalizedData.tfn) updateData.tfn = normalizedData.tfn;
            if (normalizedData.address_line_1) updateData.address_line1 = normalizedData.address_line_1;
            if (normalizedData.address_line_2) updateData.address_line2 = normalizedData.address_line_2;
            if (normalizedData.city) updateData.city = normalizedData.city;
            if (normalizedData.state) updateData.state = normalizedData.state;
            if (normalizedData.postcode) updateData.postcode = normalizedData.postcode;
            if (normalizedData.country) updateData.country = normalizedData.country;
            if (normalizedData.allocation !== null && normalizedData.allocation !== undefined) {
              updateData.allocation_percentage = normalizedData.allocation;
            }
            if (normalizedData.beneficiary_type) updateData.beneficiary_type = normalizedData.beneficiary_type;
            if (normalizedData.priority !== null && normalizedData.priority !== undefined) {
              updateData.priority = normalizedData.priority;
            }
            
            // Update draft beneficiary with collected data
            const { error: updateError } = await supabase
              .from('draft_beneficiaries')
              .update(updateData)
              .eq('id', draftId);
            
            if (updateError) {
              console.error('❌ Failed to save beneficiary data:', updateError);
            } else {
              console.log('✅ Beneficiary data saved successfully');
              console.log(`📊 Fields saved: ${Object.keys(updateData).length - 1} fields`); // -1 for updated_at
              
              // Warn about fields that couldn't be normalized
              if (beneficiaryData.date_of_birth && !normalizedData.date_of_birth) {
                console.warn('⚠️ Date of birth could not be parsed - skipped');
              }
            }
          }
        }
        
        // Check if agent is saying goodbye (conversation ending)
        const isGoodbye = /goodbye|have a great day|thank you for using|talk to you later/i.test(agentText);
        
        if (isGoodbye && !isTestSession) {
          console.log('👋 Agent ending conversation - will auto-close call in 3 seconds');
          
          // Give user time to say goodbye, then end call
          setTimeout(async () => {
            await supabase
              .from('call_sessions')
              .update({
                status: 'completed',
                ended_at: new Date().toISOString(),
                final_action: 'agent_ended'
              })
              .eq('id', sessionId);
            
            console.log('📞 Call auto-ended after agent goodbye');
            
            // Close the connection
            const connection = activeConnections.get(sessionId);
            if (connection && connection.agent) {
              connection.agent.close();
              activeConnections.delete(sessionId);
            }
          }, 3000);
        }
        
        // Save to database (skip for test sessions)
        if (!isTestSession) {
          const connection = activeConnections.get(sessionId);
          if (connection) {
            connection.transcriptSequence++;
            const { error } = await supabase
              .from('conversation_transcripts')
              .insert({
                call_session_id: sessionId,
                speaker: 'ai_bot',
                message_text: agentText,
                timestamp: new Date().toISOString(),
                sequence_number: connection.transcriptSequence
              });
            
            if (error) {
              console.error('❌ Failed to save agent transcript to DB:', error);
            }
          }
        }

        console.log(`💬 [agent]: ${agentText}`);
      }
      break;

    case 'extracted_data':
      // 11Labs agent extracted structured data from conversation
      if (message.fields) {
        // Save to database (skip for test sessions)
        if (!isTestSession && draftId) {
          await supabase
            .from('draft_beneficiaries')
            .update({
              ...message.fields,
              extraction_status: calculateExtractionStatus(message.fields)
            })
            .eq('id', draftId);
        }

        // Notify client of field extraction
        clientWs.send(JSON.stringify({
          type: 'field_extracted',
          fields: message.fields,
          timestamp: Date.now()
        }));

        console.log(`📝 Extracted fields:`, message.fields);
      }
      break;

    case 'conversation_end':
      // Agent decided conversation is complete
      if (!isTestSession) {
        await supabase
          .from('call_sessions')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
            final_action: 'natural_completion'
          })
          .eq('id', sessionId);
      }

      clientWs.send(JSON.stringify({
        type: 'status_change',
        new_status: 'completed',
        message: 'Call completed',
        timestamp: Date.now()
      }));

      console.log(`✅ Call completed naturally: ${sessionId}`);
      break;

    case 'conversation_initiation_metadata':
      // Initial metadata from 11Labs - log it for debugging
      console.log('📋 11Labs conversation initialized');
      console.log('🔍 Audio formats - Agent output:', message.conversation_initiation_metadata_event?.agent_output_audio_format);
      console.log('🔍 Audio formats - User input:', message.conversation_initiation_metadata_event?.user_input_audio_format);
      break;

    case 'ping':
      // Ignore ping messages (connection keepalive)
      // Note: If these appear after disconnect, check for orphaned connections
      break;

    default:
      console.log(`📩 Agent message: ${message.type}`, 
        message.type !== 'audio' ? message : '(audio data)');
  }
}

/**
 * Normalize beneficiary data to match database formats
 * Converts natural language values to structured formats
 */
function normalizeBeneficiaryData(data) {
  const normalized = { ...data };
  
  // Normalize date of birth (convert natural language to YYYY-MM-DD)
  if (normalized.date_of_birth) {
    normalized.date_of_birth = normalizeDate(normalized.date_of_birth);
  }
  
  // Normalize email (convert "at" and "dot" to @ and .)
  if (normalized.email) {
    normalized.email = normalized.email
      .toLowerCase()
      .replace(/\s*at\s*/gi, '@')
      .replace(/\s*dot\s*/gi, '.')
      .replace(/\s+/g, '');
  }
  
  // Normalize phone (convert text numbers to digits)
  if (normalized.phone) {
    normalized.phone = normalizePhoneNumber(normalized.phone);
  }
  
  // Normalize TFN (convert text numbers to digits)
  if (normalized.tfn) {
    normalized.tfn = normalizeNumberString(normalized.tfn);
  }
  
  // Normalize postcode (convert text numbers to digits)
  if (normalized.postcode) {
    normalized.postcode = normalizeNumberString(normalized.postcode);
  }
  
  return normalized;
}

/**
 * Convert natural language date to YYYY-MM-DD format
 */
function normalizeDate(dateText) {
  if (!dateText) return dateText;
  
  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return dateText;
  }
  
  const lower = dateText.toLowerCase();
  
  // Month mapping
  const months = {
    'january': '01', 'february': '02', 'march': '03', 'april': '04',
    'may': '05', 'june': '06', 'july': '07', 'august': '08',
    'september': '09', 'october': '10', 'november': '11', 'december': '12'
  };
  
  // Find month
  let month = null;
  let monthName = null;
  for (const [name, num] of Object.entries(months)) {
    if (lower.includes(name)) {
      month = num;
      monthName = name;
      break;
    }
  }
  
  if (!month) return dateText; // Can't parse without month
  
  // Split by month to get day part and year part
  const parts = lower.split(monthName);
  const beforeMonth = parts[0] || '';
  const afterMonth = parts[1] || '';
  
  // Extract day (usually before month or right after)
  let day = null;
  const dayMatch = (beforeMonth + afterMonth).match(/\b(\d{1,2})\b/);
  if (dayMatch) {
    day = parseInt(dayMatch[1]);
  } else {
    // Try word conversion for day
    const dayWords = beforeMonth + ' ' + afterMonth;
    const dayNum = convertWordsToNumber(dayWords);
    if (dayNum >= 1 && dayNum <= 31) {
      day = dayNum;
    }
  }
  
  // Extract year
  let year = null;
  const yearMatch = (beforeMonth + afterMonth).match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1]);
  } else {
    // Try word conversion for year - look for "two thousand"
    const yearNum = convertWordsToNumber(afterMonth);
    if (yearNum >= 1900 && yearNum <= 2100) {
      year = yearNum;
    }
  }
  
  if (month && day && year) {
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  }
  
  // If parsing fails, return null to avoid DB error
  console.warn('⚠️ Could not parse date:', dateText);
  return null;
}

/**
 * Convert spelled-out numbers to digits
 */
function convertWordsToNumber(text) {
  const ones = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
    'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19
  };
  
  const tens = {
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
  };
  
  let total = 0;
  let current = 0;
  
  // Handle "two thousand" pattern
  if (/two thousand/i.test(text)) {
    total += 2000;
    text = text.replace(/two thousand/i, '');
  }
  
  // Handle tens place (twenty, thirty, etc.)
  for (const [word, value] of Object.entries(tens)) {
    if (new RegExp(word, 'i').test(text)) {
      current += value;
      text = text.replace(new RegExp(word, 'i'), '');
    }
  }
  
  // Handle ones place
  for (const [word, value] of Object.entries(ones)) {
    if (new RegExp('\\b' + word + '\\b', 'i').test(text)) {
      current += value;
      text = text.replace(new RegExp('\\b' + word + '\\b', 'i'), '');
    }
  }
  
  total += current;
  return total;
}

/**
 * Normalize phone number (convert text to digits)
 */
function normalizePhoneNumber(phoneText) {
  // If already digits, return as-is
  if (/^\d+$/.test(phoneText.replace(/[\s-]/g, ''))) {
    return phoneText.replace(/[\s-]/g, '');
  }
  
  // Convert word numbers to digits
  const digitMap = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
  };
  
  let result = phoneText.toLowerCase();
  for (const [word, digit] of Object.entries(digitMap)) {
    result = result.replace(new RegExp(word, 'g'), digit);
  }
  
  // Remove spaces and return
  return result.replace(/\s+/g, '');
}

/**
 * Normalize number string (TFN, postcode, etc.)
 */
function normalizeNumberString(text) {
  // If already digits, return as-is
  if (/^\d+$/.test(text.replace(/[\s-]/g, ''))) {
    return text.replace(/[\s-]/g, '');
  }
  
  // Convert word numbers to digits
  const digitMap = {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9'
  };
  
  let result = text.toLowerCase();
  for (const [word, digit] of Object.entries(digitMap)) {
    result = result.replace(new RegExp(word, 'g'), digit);
  }
  
  // Remove spaces and return
  return result.replace(/\s+/g, '');
}

/**
 * Detect which field the agent is asking for based on their question
 */
function detectFieldFromQuestion(agentQuestion) {
  const lower = agentQuestion.toLowerCase();
  
  if (/(?:full (?:legal )?name|what is (?:the )?name|beneficiary'?s? name)/i.test(lower)) {
    return 'full_name';
  } else if (/relationship/i.test(lower)) {
    return 'relationship';
  } else if (/date of birth|dob|born/i.test(lower)) {
    return 'date_of_birth';
  } else if (/email/i.test(lower)) {
    return 'email';
  } else if (/phone|telephone|mobile/i.test(lower)) {
    return 'phone';
  } else if (/tfn|tax file number/i.test(lower)) {
    return 'tfn';
  } else if (/address|street/i.test(lower)) {
    return 'address_line1';
  } else if (/city|suburb/i.test(lower)) {
    return 'city';
  } else if (/state|province/i.test(lower)) {
    return 'state';
  } else if (/postcode|postal code|zip/i.test(lower)) {
    return 'postcode';
  } else if (/country/i.test(lower)) {
    return 'country';
  } else if (/allocat|percentage|how much|what percent/i.test(lower)) {
    return 'allocation_percentage';
  } else if (/binding|non[- ]?binding|type/i.test(lower)) {
    return 'beneficiary_type';
  } else if (/priority|primary|contingent/i.test(lower)) {
    return 'priority';
  }
  
  return null;
}

/**
 * Extract a specific field from user's response
 */
function extractSpecificField(fieldName, userResponse) {
  const data = {};
  
  switch (fieldName) {
    case 'full_name':
      data.full_name = extractName(userResponse);
      break;
    case 'relationship':
      data.relationship = extractRelationship(userResponse);
      break;
    case 'date_of_birth':
      const dob = extractDateOfBirth(userResponse);
      if (dob) data.date_of_birth = normalizeDate(dob);
      break;
    case 'email':
      const email = extractEmail(userResponse);
      if (email) data.email = email;
      break;
    case 'phone':
      const phone = extractPhone(userResponse);
      if (phone) data.phone = normalizePhoneNumber(phone);
      break;
    case 'tfn':
      const tfn = extractTFN(userResponse);
      if (tfn) data.tfn = normalizeNumberString(tfn);
      break;
    case 'address_line1':
      data.address_line1 = extractAddress(userResponse);
      break;
    case 'city':
      data.city = extractCity(userResponse);
      break;
    case 'state':
      data.state = extractState(userResponse);
      break;
    case 'postcode':
      const postcode = extractPostcode(userResponse);
      if (postcode) data.postcode = normalizeNumberString(postcode);
      break;
    case 'country':
      data.country = extractCountry(userResponse);
      break;
    case 'allocation_percentage':
      const allocation = extractAllocation(userResponse);
      if (allocation) data.allocation_percentage = allocation;
      break;
    case 'beneficiary_type':
      const type = extractBeneficiaryType(userResponse);
      if (type) data.beneficiary_type = type;
      break;
    case 'priority':
      const priority = extractPriority(userResponse);
      if (priority) data.priority = priority;
      break;
  }
  
  return data;
}

/**
 * Extract fields from user's response based on agent's next question context
 * Uses agent's new question to understand what the user just answered
 */
function extractFieldsFromUserResponse(userResponse, agentNextQuestion) {
  const data = {};
  const lower = agentNextQuestion.toLowerCase();
  
  // Determine what field was just answered based on agent's new question
  if (/relationship/i.test(lower)) {
    // Agent is now asking about relationship, so user just gave the name
    data.full_name = extractName(userResponse);
  } else if (/date of birth|dob|born/i.test(lower)) {
    // Agent is now asking about DOB, so user just gave relationship
    data.relationship = extractRelationship(userResponse);
  } else if (/email/i.test(lower)) {
    // Agent is now asking about email, so user just gave DOB
    const dob = extractDateOfBirth(userResponse);
    if (dob) data.date_of_birth = normalizeDate(dob);
  } else if (/phone|telephone|mobile/i.test(lower)) {
    // Agent is now asking about phone, so user just gave email
    const email = extractEmail(userResponse);
    if (email) data.email = email;
  } else if (/tfn|tax file number/i.test(lower)) {
    // Agent is now asking about TFN, so user just gave phone
    const phone = extractPhone(userResponse);
    if (phone) data.phone = normalizePhoneNumber(phone);
  } else if (/address|street/i.test(lower)) {
    // Agent is now asking about address, so user just gave TFN
    const tfn = extractTFN(userResponse);
    if (tfn) data.tfn = normalizeNumberString(tfn);
  } else if (/city|suburb/i.test(lower)) {
    // Agent is now asking about city, so user just gave address
    data.address_line1 = extractAddress(userResponse);
  } else if (/state|province/i.test(lower)) {
    // Agent is now asking about state, so user just gave city
    data.city = extractCity(userResponse);
  } else if (/postcode|postal code|zip/i.test(lower)) {
    // Agent is now asking about postcode, so user just gave state
    data.state = extractState(userResponse);
  } else if (/country/i.test(lower)) {
    // Agent is now asking about country, so user just gave postcode
    const postcode = extractPostcode(userResponse);
    if (postcode) data.postcode = normalizeNumberString(postcode);
  } else if (/allocat|percentage/i.test(lower)) {
    // Agent is now asking about allocation, so user just gave country
    data.country = extractCountry(userResponse);
  } else if (/binding|non[- ]?binding|type/i.test(lower)) {
    // Agent is now asking about beneficiary type, so user just gave allocation
    const allocation = extractAllocation(userResponse);
    if (allocation) data.allocation_percentage = allocation;
  } else if (/priority|primary|contingent/i.test(lower)) {
    // Agent is now asking about priority, so user just gave beneficiary type
    const type = extractBeneficiaryType(userResponse);
    if (type) data.beneficiary_type = type;
  }
  
  return data;
}

// Helper extraction functions
function extractName(text) {
  // Look for patterns like "John Doe", "My name is John", etc.
  const match = text.match(/(?:name is |is |it's |it is )?([A-Z][a-z]+(?: [A-Z][a-z]+)+)/);
  return match ? match[1].trim() : text.trim();
}

function extractRelationship(text) {
  const lower = text.toLowerCase();
  const relationships = ['spouse', 'wife', 'husband', 'partner', 'child', 'son', 'daughter', 'parent', 'mother', 'father', 'sibling', 'brother', 'sister', 'friend', 'relative'];
  for (const rel of relationships) {
    if (lower.includes(rel)) return rel;
  }
  return text.trim();
}

function extractDateOfBirth(text) {
  // Extract any date-like pattern
  return text.trim();
}

function extractEmail(text) {
  // Normalize "at" and "dot" to proper email format
  return text.toLowerCase().replace(/\s*at\s*/gi, '@').replace(/\s*dot\s*/gi, '.').replace(/\s+/g, '');
}

function extractPhone(text) {
  return text.replace(/\s+/g, '');
}

function extractTFN(text) {
  return text.replace(/\s+/g, '');
}

function extractAddress(text) {
  return text.trim();
}

function extractCity(text) {
  return text.trim();
}

function extractState(text) {
  return text.trim();
}

function extractPostcode(text) {
  return text.replace(/\s+/g, '');
}

function extractCountry(text) {
  return text.trim();
}

function extractAllocation(text) {
  const match = text.match(/(\d+)/);
  if (match) return parseInt(match[1]);
  
  const words = text.toLowerCase();
  const percentMap = {
    'hundred': 100, 'one hundred': 100, 'ninety': 90, 'eighty': 80,
    'seventy': 70, 'sixty': 60, 'fifty': 50, 'forty': 40,
    'thirty': 30, 'twenty': 20, 'ten': 10
  };
  for (const [word, value] of Object.entries(percentMap)) {
    if (words.includes(word)) return value;
  }
  return null;
}

function extractBeneficiaryType(text) {
  const lower = text.toLowerCase();
  if (/binding|yes/.test(lower)) return 'binding';
  if (/non[- ]?binding|no/.test(lower)) return 'non_binding';
  return null;
}

function extractPriority(text) {
  const lower = text.toLowerCase();
  if (/primary|first|main/.test(lower)) return 'primary';
  if (/contingent|secondary|backup/.test(lower)) return 'contingent';
  return null;
}

/**
 * Extract individual fields from agent's current response (for real-time updates)
 * This captures fields as the agent asks questions, not just at final confirmation
 */
function extractIndividualFields(text) {
  const data = {};
  
  // Extract name when agent repeats it back
  const nameMatch = text.match(/(?:full legal name|name)\s+is\s+([^,\.]+?)(?:,|\.|$)/i);
  if (nameMatch) {
    data.full_name = nameMatch[1].trim();
  }
  
  // Extract relationship
  const relationshipMatch = text.match(/relationship\s+(?:to.*?\s+)?is\s+([^,\.]+?)(?:,|\.|$)/i);
  if (relationshipMatch) {
    data.relationship = relationshipMatch[1].trim();
  }
  
  // Extract date of birth
  const dobMatch = text.match(/date of birth\s+is\s+([^,\.]+?)(?:,|\.|$)/i);
  if (dobMatch) {
    const rawDob = dobMatch[1].trim();
    data.date_of_birth = normalizeDate(rawDob);
  }
  
  // Extract email
  const emailMatch = text.match(/email(?:\s+address)?\s+is\s+([a-zA-Z0-9._%+-]+\s*(?:at|@)\s*[a-zA-Z0-9.-]+\s*(?:dot|\.)\s*[a-zA-Z]{2,}[^,\.]*)/i);
  if (emailMatch) {
    const rawEmail = emailMatch[1].trim();
    data.email = rawEmail.replace(/\s*at\s*/gi, '@').replace(/\s*dot\s*/gi, '.').replace(/\s+/g, '').toLowerCase();
  }
  
  // Extract phone
  const phoneMatch = text.match(/phone\s+(?:number\s+)?is\s+([^,\.]+?)(?:,|\.|$)/i);
  if (phoneMatch) {
    data.phone = normalizePhoneNumber(phoneMatch[1].trim());
  }
  
  // Extract TFN
  const tfnMatch = text.match(/TFN\s+is\s+([^,\.]+?)(?:,|\.|$)/i);
  if (tfnMatch) {
    data.tfn = normalizeNumberString(tfnMatch[1].trim());
  }
  
  // Extract address
  const addressMatch = text.match(/address\s+is\s+([^,\.]+?)(?:,|\.|$)/i);
  if (addressMatch) {
    data.address_line1 = addressMatch[1].trim();
  }
  
  // Extract city
  const cityMatch = text.match(/city\s+is\s+([^,\.]+?)(?:,|\.|$)/i);
  if (cityMatch) {
    data.city = cityMatch[1].trim();
  }
  
  // Extract state
  const stateMatch = text.match(/state\s+is\s+([^,\.]+?)(?:,|\.|$)/i);
  if (stateMatch) {
    data.state = stateMatch[1].trim();
  }
  
  // Extract postcode
  const postcodeMatch = text.match(/postcode\s+is\s+([^,\.]+?)(?:,|\.|$)/i);
  if (postcodeMatch) {
    data.postcode = normalizeNumberString(postcodeMatch[1].trim());
  }
  
  // Extract country
  const countryMatch = text.match(/country\s+is\s+([^,\.]+?)(?:,|\.|$)/i);
  if (countryMatch) {
    data.country = countryMatch[1].trim();
  }
  
  // Extract allocation percentage
  const allocationMatch = text.match(/allocat(?:e|ion)\s+.*?(\d+|one hundred|fifty|twenty|thirty|forty|sixty|seventy|eighty|ninety).*?percent/i);
  if (allocationMatch) {
    const percentText = allocationMatch[1].toLowerCase();
    const percentMap = {
      'one hundred': 100, 'hundred': 100, 'ninety': 90, 'eighty': 80,
      'seventy': 70, 'sixty': 60, 'fifty': 50, 'forty': 40,
      'thirty': 30, 'twenty': 20, 'ten': 10
    };
    data.allocation_percentage = percentMap[percentText] || parseInt(percentText) || null;
  }
  
  // Extract beneficiary type (binding/non_binding)
  const typeMatch = text.match(/beneficiary type\s+is\s+(binding|non[- ]?binding)/i);
  if (typeMatch) {
    const type = typeMatch[1].toLowerCase().replace(/[- ]/g, '_');
    data.beneficiary_type = type === 'binding' ? 'binding' : 'non_binding';
  }
  
  // Extract priority (primary/contingent)
  const priorityMatch = text.match(/(?:priority|beneficiary type)\s+(?:is\s+)?(primary|contingent)/i);
  if (priorityMatch) {
    data.priority = priorityMatch[1].toLowerCase();
  }
  
  return data;
}

/**
 * Parse beneficiary data from agent's confirmation message
 * Extracts all 15 required fields from natural language
 */
function parseBeneficiaryData(text) {
  const data = {
    full_name: null,
    relationship: null,
    date_of_birth: null,
    email: null,
    phone: null,
    tfn: null,
    address_line_1: null,
    address_line_2: null,
    city: null,
    state: null,
    postcode: null,
    country: null,
    allocation: null,
    beneficiary_type: null,
    priority: null
  };
  
  // Extract full legal name
  const nameMatch = text.match(/(?:full legal name|name) is ([^,\.]+?)(?:,|\.|;)/i);
  if (nameMatch) {
    data.full_name = nameMatch[1].trim();
  }
  
  // Extract relationship
  const relationshipMatch = text.match(/relationship (?:to.*? )?is ([^,\.;]+?)(?:,|\.|;)/i);
  if (relationshipMatch) {
    data.relationship = relationshipMatch[1].trim();
  }
  
  // Extract date of birth (various formats: DD/MM/YYYY, 1st January 2000, etc.)
  const dobMatch = text.match(/(?:date of birth|DOB|born on) is ([^,\.;]+?)(?:,|\.|;)/i);
  if (dobMatch) {
    data.date_of_birth = dobMatch[1].trim();
  }
  
  // Extract email (handle both formats: "john@gmail.com" or "john at gmail dot com")
  const emailMatch = text.match(/email (?:address )?is ([a-zA-Z0-9._%+-]+(?:\s*at\s*|\s*@\s*)[a-zA-Z0-9.-]+(?:\s*dot\s*|\s*\.\s*)[a-zA-Z]{2,}[^,\.;]*)/i);
  if (emailMatch) {
    data.email = emailMatch[1].trim();
  }
  
  // Extract phone
  const phoneMatch = text.match(/(?:phone|telephone|mobile) (?:number )?is ([^,\.;]+?)(?:,|\.|;)/i);
  if (phoneMatch) {
    data.phone = phoneMatch[1].trim().replace(/\s+/g, ''); // Remove spaces
  }
  
  // Extract TFN (Tax File Number - 9 digits)
  const tfnMatch = text.match(/(?:TFN|tax file number) is (\d{3}[\s-]?\d{3}[\s-]?\d{3})/i);
  if (tfnMatch) {
    data.tfn = tfnMatch[1].replace(/[\s-]/g, ''); // Remove spaces and hyphens
  }
  
  // Extract address components
  const addressLine1Match = text.match(/(?:address|street address|address line 1) is ([^,\.;]+?)(?:,|\.|;)/i);
  if (addressLine1Match) {
    data.address_line_1 = addressLine1Match[1].trim();
  }
  
  const addressLine2Match = text.match(/(?:address line 2|apartment|suite|unit) (?:is )?([^,\.;]+?)(?:,|\.|;)/i);
  if (addressLine2Match) {
    data.address_line_2 = addressLine2Match[1].trim();
  }
  
  const cityMatch = text.match(/(?:city|suburb) is ([^,\.;]+?)(?:,|\.|;)/i);
  if (cityMatch) {
    data.city = cityMatch[1].trim();
  }
  
  const stateMatch = text.match(/(?:state|territory) is ([^,\.;]+?)(?:,|\.|;)/i);
  if (stateMatch) {
    data.state = stateMatch[1].trim();
  }
  
  const postcodeMatch = text.match(/postcode is (\d{4})/i);
  if (postcodeMatch) {
    data.postcode = postcodeMatch[1];
  }
  
  const countryMatch = text.match(/country is ([^,\.;]+?)(?:,|\.|;)/i);
  if (countryMatch) {
    data.country = countryMatch[1].trim();
  }
  
  // Extract allocation percentage
  const allocationMatch = text.match(/allocation.*?(\d+|one hundred|fifty|twenty|thirty|forty|sixty|seventy|eighty|ninety).*?percent/i);
  if (allocationMatch) {
    const percentText = allocationMatch[1].toLowerCase();
    const percentMap = {
      'one hundred': 100, 'hundred': 100,
      'ninety': 90, 'eighty': 80, 'seventy': 70,
      'sixty': 60, 'fifty': 50, 'forty': 40,
      'thirty': 30, 'twenty': 20, 'ten': 10
    };
    data.allocation = percentMap[percentText] || parseInt(percentText) || null;
  }
  
  // Extract beneficiary type (binding/non_binding)
  const typeMatch = text.match(/(?:beneficiary )?type is (binding|non[- ]?binding)/i);
  if (typeMatch) {
    const type = typeMatch[1].toLowerCase().replace(/[- ]/g, '_');
    data.beneficiary_type = type === 'binding' ? 'binding' : 'non_binding';
  }
  
  // Extract priority (primary/contingent) - often confused with "type" in speech
  const priorityMatch = text.match(/(?:priority|type)\s+(?:is\s+)?(primary|contingent)/i);
  if (priorityMatch) {
    data.priority = priorityMatch[1].toLowerCase();
  }
  
  return data;
}

/**
 * Calculate extraction status based on collected fields
 */
function calculateExtractionStatus(fields) {
  const requiredFields = ['full_name', 'relationship', 'allocation_percentage'];
  const hasAllRequired = requiredFields.every(field => fields[field]);

  if (Object.keys(fields).length === 0) return 'empty';
  if (hasAllRequired) return 'complete';
  return 'partial';
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received, closing server...');
  
  // Close all active connections
  activeConnections.forEach(({ agent }) => {
    agent.close();
  });

  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

console.log('✅ Colonial Call Service Backend initialized');
