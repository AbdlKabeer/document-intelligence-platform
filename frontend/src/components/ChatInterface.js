"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Upload, Bot, Trash2, FileText, ChevronDown, ChevronUp, Loader2, AlertCircle, Check, Menu } from 'lucide-react';
import { Alert, AlertDescription, } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { UserMenu } from '@/components/ui/usermenu';
import { RiskAnalysisFlow } from '@/components/ui/risk-analysis'
import { RiskAnalysisResults } from '@/components/ui/risk-analysis-result'
import { TaxReviewDocument } from '@/components/ui/tax-review-doc';
import { MessageActions } from '@/components/ui/message-actions';

const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [documents, setDocuments] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isDocumentsPanelOpen, setIsDocumentsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState('');
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [recentChats, setRecentChats] = useState([]);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [isRiskAnalysisMode, setIsRiskAnalysisMode] = useState(false);
  const dragCounter = useRef(0);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const sidebarRef = useRef(null);
  const router = useRouter();

  // if not login, dont show page
  // Updated useEffect for initial data fetching
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    let isSubscribed = true;

    const fetchData = async () => {
      try {
        // Fetch chats - won't throw on empty data
        if (isSubscribed) {
          await getChats();
        }

        // Fetch documents
        if (isSubscribed) {
          try {
            await fetchDocuments();
          } catch (error) {
            console.warn('Could not fetch documents:', error);
            setDocuments([]); // Set empty array for documents too
          }
        }

        // Try to load specific chat if on a chat route
        if (isSubscribed) {
          const path = window.location.pathname;
          const match = path.match(/\/chat\/([^\/]+)/);
          
          if (match) {
            const chatUuid = match[1];
            try {
              await loadChat(chatUuid);
            } catch (error) {
              if (error.message === 'Chat not found') {
                router.push('/chat/');
                showStatus('Chat not found or was deleted');
              } else {
                console.warn('Error loading specific chat:', error);
                // Don't show error status for missing chat
              }
            }
          }
        }
      } catch (error) {
        if (isSubscribed) {
          // Only log real errors, not empty states
          console.warn('Error in data fetch:', error);
        }
      }
    };

    fetchData();

    return () => {
      isSubscribed = false;
    };
  }, [router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Sidebar hover effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX <= 20) {
        setIsSidebarHovered(true);
      }
    };

    const handleMouseLeave = (e) => {
      if (!sidebarRef.current?.contains(e.target)) {
        setIsSidebarHovered(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const loadChat = async (chatUuid) => {
    try {
      const response = await fetch(`http://localhost:8000/chats/${chatUuid}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 404) {
        throw new Error('Chat not found');
      }
      
      if (!response.ok) {
        throw new Error('Failed to load chat');
      }
      
      const chatData = await response.json();
      
      setCurrentChatId(chatData.uuid);
      
      // Ensure messages is an array before mapping
      const messageArray = Array.isArray(chatData.messages) ? chatData.messages : [];
      
      setMessages(messageArray.map(msg => {
        // Handle different content types
        if (msg.content_type === 'image') {
          return {
            type: msg.type,
            content: <img src={msg.content} alt="Response" className="max-w-full rounded-lg" />
          };
        } else if (msg.content_type === 'risk_analysis') {
          // Parse the stringified content for risk analysis messages
          const parsedContent = JSON.parse(msg.content);
          return {
            type: msg.type,
            content: parsedContent.message,
            results: parsedContent.results
          };
        } else if (msg.content_type === 'tax_review') {
          // Return tax review message with proper content type
          return {
            type: msg.type,
            content: msg.content,
            content_type: 'tax_review'
          };
        } else {
          // Default text content
          return {
            type: msg.type,
            content: msg.content
          };
        }
      }));
    } catch (error) {
      console.error('Error loading chat:', error);
      setMessages([]); // Reset messages on error
      throw error;
    }
  };

  const getChats = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:8000/chats/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
  
      if (!response.ok) {
        // Handle other error cases (500, etc.)
        console.error(`Server error: ${response.status}`);
        setRecentChats([]);
        return;
      }
  
      // Handle successful response
      const data = await response.json();
      
      // Ensure we always set an array, even if the response is empty
      if (Array.isArray(data)) {
        setRecentChats(data);
      } else {
        console.warn('Received non-array data from chats endpoint:', data);
        setRecentChats([]);
      }
  
    } catch (error) {
      // Handle network errors or JSON parsing errors
      console.error('Error fetching chats:', error);
      setRecentChats([]);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
  
      const response = await fetch('http://localhost:8000/documents/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Add cache control to prevent browser caching
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
  
      if (response.status === 404) {
        setDocuments([]);
        return;
      }
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      const data = await response.json();
      // Ensure we're setting a new array reference to trigger re-render
      setDocuments(Array.isArray(data) ? [...data] : []);
    } catch (error) {
      console.warn('Could not fetch documents:', error);
      setDocuments([]);
    }
  };

  const showStatus = (message, isError = false) => {
    setUploadStatus(message);
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessageForUI = {
      type: 'user',
      content: input
    };

    const userMessageForAPI = {
      type: 'user',
      content: input,
      content_type: 'text',
      timestamp: new Date().toISOString()
    };

    let chatId = currentChatId;
    const currentInput = input;

    setInput('');
    setIsLoading(true);

    try {
      // Create new chat if needed
      if (!chatId) {
        const createChatResponse = await fetch('http://localhost:8000/chats/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ title: currentInput.substring(0, 50) })
        });

        if (!createChatResponse.ok) throw new Error('Failed to create chat');

        const chatData = await createChatResponse.json();
        chatId = chatData.uuid;
        setCurrentChatId(chatId);

        window.history.pushState({}, '', `/chat/${chatId}`);
      }

      // Update UI with user message
      setMessages(prev => [...prev, userMessageForUI]);

      // Save user message
      const saveMessageResponse = await fetch(`http://localhost:8000/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(userMessageForAPI)
      });

      if (!saveMessageResponse.ok) throw new Error('Failed to save message');

      // Query endpoint to determine message type
      const queryResponse = await fetch('http://localhost:8000/get_query_type/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ question: currentInput, chat_id: chatId })
      });

      if (!queryResponse.ok) throw new Error('Failed to get response');

      const { type } = await queryResponse.json();

      // Check if this is a risk analysis request
      if (type === 'risk_analysis') {
        // Activate risk analysis mode
        setIsRiskAnalysisMode(true);
        
        // Add system message with form (not saved to DB)
        const systemMessage = {
          type: 'assistant',
          content: "I'll help you with the risk analysis. Please provide the following information using the form below:",
          component: <RiskAnalysisFlow 
            onComplete={async (analysisData, companyInfo) => {
              setIsRiskAnalysisMode(false);
              setIsLoading(true);
              try {
                // Send the collected data to the risk analysis endpoint
                const requestBody = {
                  yearlyData: analysisData,
                  companyInfo: companyInfo
                };
                
                const analysisResponse = await fetch('http://localhost:8000/analyze-risk', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify(requestBody)
                });

                if (!analysisResponse.ok) throw new Error('Failed to process risk analysis');

                //const results = await analysisResponse.json();
                const data = await analysisResponse.json();

                const results = data.results
                const review = data.review.review
                
                // Create messages for UI and API
                const resultsMessageForUI = {
                  type: 'assistant',
                  content: "Here are the results of the risk analysis:",
                  results: results
                };

                const resultsMessageForAPI = {
                  type: 'assistant',
                  content: JSON.stringify({
                    message: "Here are the results of the risk analysis:",
                    results: results
                  }),
                  content_type: 'risk_analysis',
                  timestamp: new Date().toISOString()
                };

                // In handleSend where you create the review messages:
                const reviewMessageForUI = {
                  type: 'assistant',
                  content: review,
                  content_type: 'tax_review'  // Add content_type to identify review messages
                };

                const reviewMessageForAPI = {
                  type: 'assistant',
                  content: review,
                  content_type: 'tax_review',  // Match the UI content type
                  timestamp: new Date().toISOString()
                };

                // Save results message to database
                await fetch(`http://localhost:8000/chats/${chatId}/messages`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify(resultsMessageForAPI)
                });

                // Save review message to database
                await fetch(`http://localhost:8000/chats/${chatId}/messages`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify(reviewMessageForAPI)
                });

                // Update UI with results
                setMessages(prev => [...prev, resultsMessageForUI]);
                setMessages(prev => [...prev, reviewMessageForUI]);
              } catch (error) {
                console.error('Risk analysis error:', error);
                setMessages(prev => [...prev, {
                  type: 'assistant',
                  content: "I apologize, but there was an error processing the risk analysis."
                }]);
              } finally {
                setIsLoading(false);
              }
            }}
          />
        };
        
        setMessages(prev => [...prev, systemMessage]);
      } else {
        // Handle regular chat messages as before
        const assistantResponse = await fetch('http://localhost:8000/query/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ question: currentInput, chat_id: chatId })
        });

        if (!assistantResponse.ok) throw new Error('Failed to get response');

        const contentType = assistantResponse.headers.get("Content-Type");
        let assistantMessageForUI;
        let assistantMessageForAPI;

        if (contentType && contentType.startsWith("image/")) {
          const imageBlob = await assistantResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          
          assistantMessageForUI = {
            type: 'assistant',
            content: <img src={imageUrl} alt="Response" className="max-w-full rounded-lg" />
          };

          assistantMessageForAPI = {
            type: 'assistant',
            content: imageUrl,
            content_type: 'image',
            timestamp: new Date().toISOString()
          };
        } else {
          const data = await assistantResponse.json();
          const content = data.answer || "I apologize, but I couldn't process your request.";
          
          assistantMessageForUI = {
            type: 'assistant',
            content: content
          };

          assistantMessageForAPI = {
            type: 'assistant',
            content: content,
            content_type: 'text',
            timestamp: new Date().toISOString()
          };
        }

        // Save assistant message
        await fetch(`http://localhost:8000/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(assistantMessageForAPI)
        });

        // Update UI with assistant message
        setMessages(prev => [...prev, assistantMessageForUI]);
      }

      // Update recent chats after successful conversation
      await getChats();
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: "I apologize, but there was an error processing your request."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a ref map to store refs for each message
  const messageRefs = React.useRef(new Map());

  // Function to get or create refs for a message
  const getMessageRefs = (messageId) => {
    if (!messageRefs.current.has(messageId)) {
      messageRefs.current.set(messageId, {
        contentRef: React.createRef(),
        componentRef: React.createRef()
      });
    }
    return messageRefs.current.get(messageId);
  };

  const renderMessage = (message, index) => {
    // Get refs for this message
    const { contentRef, componentRef } = getMessageRefs(index);
    
    const messageClass = `max-w-[80%] p-3 rounded-lg relative ${
      message.type === 'user' 
        ? 'bg-amber-100 text-stone-800' 
        : 'bg-green-50 text-stone-800 shadow-sm'
    }`;
  
    // Helper function to render content based on type
    const renderContent = () => {
      // Handle tax review documents
      if (message.content_type === 'tax_review') {
        return (
          <div ref={contentRef}>
            <TaxReviewDocument content={message.content} />
          </div>
        );
      }
  
      // Handle other content types
      if (typeof message.content === 'string') {
        return (
          <div ref={contentRef}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        );
      }
      return <div ref={contentRef}>{message.content}</div>;
    };
  
    return (
      <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`${messageClass} ${message.content_type === 'tax_review' ? 'max-w-full w-full' : ''}`}>
          {/* Add MessageActions component */}
          <div className="mb-6">
          <MessageActions 
            message={message} 
            componentRef={componentRef}
            contentRef={contentRef}
          />
          </div>
          
          {/* Render message content */}
          {renderContent()}
  
          {/* Render component if present */}
          {message.component && (
            <div className="mt-4" ref={componentRef}>
              {message.component}
            </div>
          )}
  
          {/* Render analysis results if present */}
          {message.results && (
            <div className="mt-4" ref={componentRef}>
              <RiskAnalysisResults results={message.results} />
            </div>
          )}
        </div>
      </div>
    );
  };

  const validateFile = (file) => {
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
      return `Upload Failed. File type not allowed: ${file.name}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `Upload Failed. File too large: ${file.name} (max 10MB)`;
    }
    return null;
  };

  const handleFileUpload = async (files) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  
    const validFiles = [];
    const errors = [];
  
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });
  
    if (errors.length > 0) {
      showStatus(errors.join(', '), true);
      return;
    }
  
    for (const file of validFiles) {
      const formData = new FormData();
      formData.append('file', file);
  
      try {
        showStatus(`Uploading ${file.name}...`);
        const response = await fetch('http://localhost:8000/upload/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });
  
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
  
        if (!response.ok) throw new Error('Upload failed');
  
        const responseData = await response.json();
  
        // Transform the response data to match the expected document structure
        const newDocument = {
          id: responseData.document_id,  // map document_id to id
          filename: file.name,           // use the filename from the uploaded file
          created_at: new Date().toISOString() // set the current timestamp or adjust as needed
        };
  
        // Update state to include the new document
        setDocuments(prevDocuments => [newDocument, ...prevDocuments]);
  
        showStatus(
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Successfully uploaded {file.name}</span>
          </div>
        );
      } catch (error) {
        console.error('Upload error:', error);
        showStatus(
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Failed to upload {file.name}</span>
          </div>, 
          true
        );
      }
    }
  };  
  
  const deleteDocument = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/documents/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Delete failed');
      setDocuments(documents.filter((doc) => doc.id !== id));
      showStatus('Document deleted successfully');

      setDocumentToDelete(null);
    } catch (error) {
      showStatus('Failed to delete document', true);
    }
  };

  const confirmDeleteDocument = (docId) => {
    setDocumentToDelete(docId);
  };

  const cancelDeleteDocument = () => {
    setDocumentToDelete(null);
  };

  const deleteChat = async (chatUuid) => {
    const token = localStorage.getItem('token');
    try {
      const deleteResponse = await fetch(`http://localhost:8000/chats/${chatUuid}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!deleteResponse.ok) {
        throw new Error('Failed to delete chat');
      }

      // Update the recent chats state
      setRecentChats(prevChats => prevChats.filter(chat => chat.uuid !== chatUuid));
      showStatus('Chat deleted successfully');

      // Clear current chat state if we're deleting the active chat
      if (currentChatId === chatUuid) {
        setCurrentChatId(null);
        setMessages([]);
        router.push('/chat/');
      }

      // Clear the chatToDelete state
      setChatToDelete(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
      showStatus('Error deleting chat', true);
    }
  };

  // Function to open the delete confirmation modal
  const confirmDelete = (chatUuid) => {
    setChatToDelete(chatUuid);
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setChatToDelete(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    setDragError('');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    
    const items = Array.from(e.dataTransfer.items);
    const hasFiles = items.some(item => item.kind === 'file');
    
    if (hasFiles) {
      setIsDragging(true);
      setDragError('');
    } else {
      setDragError('Please drag files only');
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
      setDragError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className="h-screen flex flex-col bg-green-50/40 relative"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`fixed left-0 top-0 bottom-0 w-[300px] bg-green-50/40 shadow-lg z-30 transition-all duration-300 ease-in-out 
          ${isSidebarHovered ? 'translate-x-0' : '-translate-x-[calc(100%-9px)]'} 
          border-r border-stone-100 overflow-y-auto`}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="p-4 border-b">
          {/* New Chat Button */}
          <Link href="/chat/" passHref>
            <button className="w-full mb-4 py-2 bg-amber-50 border border-amber-200 text-stone-600 rounded-md hover:border-amber-300 hover:bg-amber-100 transition duration-200">
              Create New Chat
            </button>
          </Link>
          <h2 className="text-lg font-semibold text-stone-800 flex items-center gap-2 mt-2">
            <Menu className="w-5 h-5" />
            Chats & Documents
          </h2>
        </div>
        
        <div className="p-4">
          <h3 className="text-sm font-medium text-stone-600 mb-2">My Chats</h3>
          <div className="space-y-2">
            {recentChats.length === 0 ? (
              <div className="p-2 bg-amber-50 border border-amber-100 rounded-md text-sm text-stone-500">
                No available chats
              </div>
            ) : (
              recentChats.slice().reverse().map((chat) => (
                <div 
                  key={chat.id} 
                  className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 hover:border-amber-300 hover:bg-amber-100 rounded-md text-sm text-stone-600"
                >
                  <Link href={`/chat/${chat.uuid}`} className="flex-1 truncate">
                    {chat.title}
                  </Link>
                  <button 
                    onClick={() => confirmDelete(chat.uuid)} 
                    className="text-stone-400 hover:text-red-500 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t">
          <h3 className="text-sm font-medium text-stone-600 mb-2">Uploaded Documents</h3>
          {documents.length === 0 ? (
            <div className="text-sm text-stone-500">
              No documents uploaded
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 hover:border-amber-300 hover:bg-amber-100 rounded-md text-sm"
                >
                  <span className="text-stone-600 truncate">{doc.filename}</span>
                  <button 
                    onClick={() => confirmDeleteDocument(doc.id)} 
                    className="text-stone-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <UserMenu />
      </div>
      
      <div style={{ zIndex: 999 }}>
        {/* Alert Dialog for Chat Deletion */}
        <AlertDialog open={chatToDelete !== null} onOpenChange={() => setChatToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chat</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this chat? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteChat(chatToDelete)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      <div style={{ zIndex: 999 }}>
        {/* Alert Dialog for Document Deletion */}
        <AlertDialog open={documentToDelete !== null} onOpenChange={cancelDeleteDocument}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this document? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDeleteDocument}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDocument(documentToDelete)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isDragging && (
        <div className="absolute inset-0 bg-green-900/10 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            {dragError ? (
              <>
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-red-800">{dragError}</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-stone-800">Drop your files here</p>
                <p className="text-sm text-stone-600 mb-2">PDF, DOC, DOCX, PPT, PPTX, JPG, PNG</p>
                <p className="text-xs text-stone-500">Maximum size: 10MB per file</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="border-b bg-green-50/40 py-4 px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-green-600" />
            <h1 className="text-xl font-semibold text-stone-800">Live Q Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              id="fileInput"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              accept={Object.values(ALLOWED_FILE_TYPES).join(',')}
              multiple
            />
            <label
              htmlFor="fileInput"
              className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 hover:border-amber-300 text-stone-600 hover:bg-amber-100 rounded-md cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </label>
          </div>
        </div>
      </div>

      <div className="bg-green-50/40 border-b">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setIsDocumentsPanelOpen(!isDocumentsPanelOpen)}
            className="w-full py-2 px-6 flex items-center justify-between text-stone-600 hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="font-medium">Available Documents</span>
              <span className="text-sm text-stone-400">({documents.length})</span>
            </div>
            {isDocumentsPanelOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isDocumentsPanelOpen && (
            <div className="p-4 border-t bg-green-50/40">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                  <p className="text-stone-600">No documents uploaded yet</p>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-stone-800 hover:text-stone-600"
                  >
                    Upload your first document
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {Array.isArray(documents) && documents.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="flex items-center justify-between p-2 rounded-md bg-amber-50 border border-amber-200 hover:border-amber-300 hover:bg-amber-100 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-stone-400" />
                        <span className="text-sm text-stone-600">{doc.filename}</span>
                      </div>
                      <button 
                        onClick={() => deleteDocument(doc.id)} 
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded-md transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-stone-400 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {uploadStatus && (
        <div className="fixed top-4 right-4 z-50">
          <Alert className={`shadow-lg ${
            typeof uploadStatus === 'string' && (uploadStatus.includes('Failed') || uploadStatus.includes('Error'))
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`}>
            <AlertDescription>{uploadStatus}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-stone-200 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-stone-600 mb-2">Welcome to Live Q Assistant</h2>
              <p className="text-stone-500 mb-4">Upload documents and ask questions to get started</p>
              {documents.length === 0 && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-amber-50 border border-amber-200 hover:border-amber-300 text-stone-600 hover:bg-amber-100 rounded-md transition-colors"
                >
                  Upload your first document
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                renderMessage(message, index)
              ))}
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-green-50">
                <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <div className="border-t bg-green-50/40 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isRiskAnalysisMode 
                  ? "Please complete the risk analysis form above..."
                  : "Ask a question about your documents..."
                }
                disabled={isRiskAnalysisMode || isLoading}
                className={`w-full p-3 rounded-lg border border-stone-200 focus:border-amber-100 focus:ring-1 focus:ring-amber-400 focus:outline-none resize-none overflow-hidden ${
                  isRiskAnalysisMode ? 'bg-stone-100 cursor-not-allowed' : ''
                }`}
                rows={1}
                style={{
                  minHeight: '2.5rem',
                  maxHeight: '150px',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || isRiskAnalysisMode}
              className={`p-3 rounded-lg mb-3 ${
                !input.trim() || isLoading || isRiskAnalysisMode
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-amber-100 text-stone-600 hover:bg-amber-200 border border-amber-200'
              } transition-colors flex items-center justify-center`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      

    </div>
  );
};

export default ChatInterface;