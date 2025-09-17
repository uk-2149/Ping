import { Send, Paperclip, Smile } from "lucide-react";
import { useState, useRef, type KeyboardEvent } from "react";
import { useChat } from "../../context/ChatContext";

export default function MessageInput() {
    const [message, setMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const { 
        sendMessage,
        activeChat
    } = useChat();

    const handleSubmit = () => {
        if (!message.trim() || !activeChat) {
            console.warn("Cannot send message: empty message or no active chat");
            return;
        }
        
        try {
            sendMessage(message.trim());
            setMessage("");
            
            // Focus back on input after sending
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            
            console.log("Message sent successfully");
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessage(value);
    };

    const handlePasteFile = (e: React.ClipboardEvent) => {
        // Handle file pasting for future implementation
        const files = e.clipboardData.files;
        if (files.length > 0) {
            console.log("Files pasted:", files);
            // TODO: Implement file upload functionality
        }
    };

    // Don't render if no active chat
    if (!activeChat) {
        return (
            <div className="px-4 py-3 border-t border-white/10 bg-[#111827]">
                <div className="flex items-center justify-center py-4">
                    <p className="text-gray-500 text-sm">Select a chat to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-3 border-t border-white/10 bg-[#111827]">
            <div className="flex items-center gap-2 bg-[#1a2234] rounded-xl border border-gray-700 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-600 transition-all duration-200">
                {/* Attachment Button */}
                <button
                    className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                    onClick={() => {
                        // TODO: Implement file attachment
                        console.log("File attachment clicked");
                    }}
                    title="Attach file"
                >
                    <Paperclip size={18} />
                </button>

                {/* Message Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={message}
                    placeholder={`Message ${activeChat.participants.find(p => p.id !== activeChat.participants[0].id)?.username || 'user'}...`}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none py-1"
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onPaste={handlePasteFile}
                    maxLength={2000}
                    disabled={!activeChat}
                />

                {/* Character Counter (shows when approaching limit) */}
                {message.length > 1800 && (
                    <span className={`text-xs ${message.length > 1950 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {2000 - message.length}
                    </span>
                )}

                {/* Emoji Button */}
                <button
                    className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600 transition-colors"
                    onClick={() => {
                        // TODO: Implement emoji picker
                        console.log("Emoji picker clicked");
                    }}
                    title="Add emoji"
                >
                    <Smile size={18} />
                </button>

                {/* Send Button */}
                <button
                    className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                        message.trim() && activeChat
                            ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95' 
                            : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                    onClick={handleSubmit}
                    disabled={!message.trim() || !activeChat}
                    title={message.trim() ? "Send message" : "Type a message to send"}
                >
                    <Send size={18} className="text-white" />
                </button>
            </div>

            {/* Message Hints */}
            {/* <div className="mt-2 px-2">
                <p className="text-xs text-gray-600">
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div> */}
        </div>
    );
}