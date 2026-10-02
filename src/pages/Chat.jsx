import React, {useState, useRef, useEffect} from "react"; 
import ReactMarkdown from "react-markdown"; 

function Chat(){

    const messagesEndRef = useRef(null); // to scroll down automatically, when new message appears 
    const chatMenuRef = useRef(null); // This ref is going to help us identify the chat action menu when checking whether a click happened outside it.
    const textareaRef = useRef(null); 

    const [input, setInput] = useState(""); 
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false); 
    const [chats, setChats] = useState([]); 
    const [currentChatId, setCurrentChatId] = useState(null);
    const [openMenu, setOpenMenu] = useState(null); 
    const [editingChatId, setEditingChatId] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false); 
    const [isLightMode, setIsLightMode] = useState(false); 
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);
    const [remove, setRemove] = useState(null); 
    const [copiedCode, setCopiedCode] = useState(null); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
        
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        }
    )}, [messages]); 

    useEffect(() => {
        if(isLoaded){
            localStorage.setItem("chats",JSON.stringify(chats))
        }
    }, [chats, isLoaded]);     

    useEffect(() => {
        if(isThemeLoaded){
            localStorage.setItem("theme", isLightMode); 
        }
    }, [isLightMode, isThemeLoaded]); 

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme"); 
        if(savedTheme !== null){
            setIsLightMode(savedTheme === "true");  
        }
        setIsThemeLoaded(true)
    }, []); 

    useEffect(() => {
        document.addEventListener("click", handleDocumentClick); 
        return(() => {
            document.removeEventListener("click",handleDocumentClick )
        }); 
    }, []); 

    useEffect(() => {
        const savedChats = localStorage.getItem("chats"); 
        if(savedChats){
            setChats(JSON.parse(savedChats))
        }
        setIsLoaded(true); 
    }, []); 

    useEffect(() => {
        if(isLightMode){
            document.body.classList.add("light-mode")
        }
        else{
            document.body.classList.remove("light-mode")
        }
    }, [isLightMode, isThemeLoaded]);     

    function handleDocumentClick(e){
        if(chatMenuRef.current && !chatMenuRef.current.contains(e.target)){
            setOpenMenu(null); 
            setEditingChatId(null); 
        }
    }

    function saveBotMessages(botText, chatId, newMessages) {
        const finalMessages =[
            ...newMessages, {
                text: botText, 
                sender: "bot"
            }
        ]; 

        if(chatId !== null) {
            setChats((previousChats) => {
                return previousChats.map((chat) => {
                    return chat.id === chatId ? 
                    {
                        ...chat, 
                        messages: finalMessages
                    } : chat
                }); 
            }); 
        }
        setMessages(finalMessages); 
    }

    async function sendMessage() {
    const userInput = input.trim(); 
    if (!userInput) {
        return;
    }

    let chatId = currentChatId; 
    setInput("");
    textareaRef.current.style.height = "auto"; 
    setIsTyping(true);

    const newMessages = [
        ...messages,
        {
            text: input,
            sender: "user"
        }
    ];

    setMessages(newMessages);
    if(chatId !== null){
            setChats((previousChats) => 
            previousChats.map((chat) => 
            chat.id === chatId ? 
                {...chat, messages: newMessages}
                : chat)); 
    }
    if(currentChatId === null){
        const newChatId = Date.now(); 
        chatId = newChatId
        setChats((previousChats) => [
            ...previousChats, {
                id: newChatId, 
                title: 
                    userInput.length > 20 ? 
                    userInput.slice(0, 20) + "..." : userInput, 
                    messages: newMessages
            }
        ]); 
        setCurrentChatId(newChatId);
    }

    try {

        const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: userInput, 
                history: newMessages
            })
        });

        const data = await response.json().catch(() => ({})); 
        console.log(data); 
        textareaRef.current.focus(); 

        if (response.ok) {
            setTimeout(() => {
                saveBotMessages(
                    data.reply,
                    chatId,
                    newMessages
                );

                setIsTyping(false);
            }, 2000);
        }

        else {
            const errorMessage =
                data.detail || "Something went wrong. Please try again.";

            saveBotMessages(errorMessage, chatId, newMessages);
            setIsTyping(false);
        }
        

    } catch (error) {
        console.log(error);
        setIsTyping(false);

        saveBotMessages( "Sorry, I couldn't connect to the server", chatId, newMessages) ; 
        }
    }        
    
    function handleKeyDown(e){
        if(e.key === "Enter" && !e.shiftKey && !isTyping){
            e.preventDefault()
            sendMessage()
        }    
    }
    
    function newChat(){
        if(messages.length > 0 && currentChatId === null){
            setChats((previousMessages) => [
            ...previousMessages, {
                id: Date.now(), 
                title: messages[0].text.length > 20 ? messages[0].text.slice(0, 20) + "...": messages[0].text, 
                messages: messages
            }
        ])
        }
        setMessages([]); 
        setInput(""); 
        setCurrentChatId(null)
    }

    function openChat(chat){

        if(isTyping){
            return; 
        }

        if(messages.length > 0 && currentChatId === null ){
            setChats((previousChats) => [
                ...previousChats, {
                    id: Date.now(), 
                    title: messages[0].text.length > 30 ? 
                        messages[0].text.slice(0, 30) + "..." : 
                        messages[0].text,
                    messages: messages
                }
            ])
        }

        setCurrentChatId((chat.id));
        setMessages(chat.messages)
    }

    function deleteChat(chatId){

        if(isTyping){
            return; 
        }

        setChats((previousChats) => 
            previousChats.filter((chat) => {
                return chat.id !== chatId; 
            })
        )
        if(chatId === currentChatId){
            setMessages([]); 
            setCurrentChatId(null); 
        }
        setOpenMenu(null); 
        setRemove(null); 
    }

    function handleTitleKeyDown(e, chatId){
        if(e.key === "Enter"){
            setChats((previousChats) => (
                previousChats.map((chat) => {
                    return chat.id === chatId ? {...chat, title: e.target.value} : chat
                })
            ))
            setEditingChatId(null); 
            setOpenMenu(null); 
        }
        if(e.key === "Escape"){
            setEditingChatId(null); 
            setOpenMenu(null);
        }
    }

    function handleTextAreaInput(e) {
        setInput(e.target.value);
        e.target.style.height = "auto";
        const newHeight = Math.min(e.target.scrollHeight, 150);
        e.target.style.height = newHeight + "px";
        e.target.style.overflowY =
            e.target.scrollHeight > 150 ? "auto" : "hidden";
    }    

    return(
        <div className={"chat-page" + (isLightMode ? " light-mode" : "") + 
            (isSidebarOpen ? "" : " sidebar-closed-page")
        } >
            <button
                className="sidebar-toggle"
                onClick={() => setIsSidebarOpen((previous) => !previous)}>
                ☰
            </button>

            <aside className={"glass " + (isSidebarOpen ? "sidebar-open" : "sidebar-closed")}>
                <h1>AI Chatbot</h1>

                <button
                    onClick={newChat}
                    disabled={isTyping}>
                    New Chat
                </button>

                <h3>Recent Chats</h3>

                {chats.map((chat) => {
                    return <li 
                                key={chat.id}
                                onClick={() => {
                                    openChat(chat);
                                }}         
                                          className={chat.id === currentChatId ? 
                                          "active-chat chat-item" : "chat-item"} >
                                    {chat.id === editingChatId ? (
                                        <input 
                                            type="text"
                                            onClick={(e) => e.stopPropagation()}
                                            defaultValue={chat.title}
                                            onKeyDown={(e) =>  handleTitleKeyDown(e, chat.id)} />
                                    ) : (
                                        <span>
                                            {chat.title}
                                        </span>
                                    )}
                                    <button 
                                        className="chat-menu-button"
                                        onClick={(e) => {e.stopPropagation(); 
                                            if(isTyping){
                                                return; 
                                            }
                                        openMenu === chat.id ? 
                                        setOpenMenu(null) : setOpenMenu(chat.id)
                                        }}>
                                        ...
                                    </button>
                                    {chat.id === openMenu && (
                                        <div 
                                            ref={chatMenuRef}
                                            className="chat-action-menu" >
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    if(isTyping){
                                                        return; 
                                                    }
                                                    setEditingChatId(chat.id); 
                                                }} >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    setRemove(chat.id)
                                                    }} >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                            </li>
                })}

                <button 
                    type="button" 
                    onClick={() => setIsLightMode((previousMode) => !previousMode)} >
                    Settings
                </button>
            </aside>

            <main>

                <div className="chat-container">

                    <header>
                        🤖 AI Assistant Online
                    </header>

                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="welcome-message" >
                                <h2>👋 HI! How can I help you today</h2>
                                <p>Ask me anything and i'll do my best to help</p>
                            </div>
                        )}
                        {messages.map((message, index) =>{
                            const isFullCode = message.text.includes("<!-- FULL_CODE -->"); 
                            return(
                                <div 
                                key={index}
                                className={
                                "message " + (message.sender === "user" ? "user-message" : "bot-message")
                            }>
                                <div className="message-label">{message.sender === "user" ? "User": "Bot"}</div>
                                {message.sender === "user" ? (
                                    <p>{message.text}</p>
                                ): 
                                (<>                                
                                    <ReactMarkdown
                                        components={{
                                            pre: ({ children }) => <>{children}</>,

                                            code: ({ inline, className, children }) => {
                                                if (inline) {
                                                    return <code>{children}</code>;
                                                }

                                                const language = className
                                                    ? className.replace("language-", "")
                                                    : "";

                                                const handleCopy = () => {
                                                    const code = String(children).replace(/\n$/, "");
                                                    navigator.clipboard.writeText(code); 
                                                    setCopiedCode(code);  
                                                    setTimeout(() => {
                                                        setCopiedCode(null); 
                                                    }, 2000); 
                                                };

                                                return (
                                                    <div className="code-block">

                                                        <div className="code-header">
                                                            <span className="code-language">
                                                                {language || "Code"}
                                                            </span>
                                                        {isFullCode && (
                                                            <div className="copy-wrapper" >
                                                                <button
                                                                    type="button"
                                                                    className="copy-button"
                                                                    onClick={handleCopy}
                                                                >
                                                                    {copiedCode === String(children).replace(/\n$/, "")  ? 
                                                                    "Copied" : "Copy"}
                                                                </button>

                                                            </div>
                                                        )}
                                                        </div>

                                                        <pre>
                                                            <code>{children}</code>
                                                        </pre>

                                                    </div>
                                                );
                                            }
                                        }}
                                    >
                                        {message.text.replace("<!-- FULL_CODE -->", "")}
                                    </ReactMarkdown>
                                        
                                    </>
                                )}
                            </div>
                            )
                                                        
                        })}    
                        {isTyping && (
                            <div className="typing-indicator" >
                                <span>🤖 Bot is typing </span>
                                <span className="dots" >
                                    <span>●</span>
                                    <span>●</span>
                                    <span>●</span>
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} ></div>
                    </div>              
                    

                    <div className="chat-input">
                       <div className="input-wrapper">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={handleTextAreaInput}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your Message...."
                                readOnly={isTyping}
                            />

                            <button 
                                onClick={sendMessage}
                                disabled={isTyping} >
                                send
                            </button> 
                        </div>                       
                    </div>
                

                </div>
            </main>

            {remove !== null && (
                <div className="delete-overlay">
                    <div className="delete-popup">
                        <p>Are you sure you want to delete this conversation?</p>
                        <div className="buttons">
                            <button 
                                className="cancel-btn"
                                onClick={() => setRemove(null)}>
                                Cancel
                            </button>

                            <button 
                                className="delete-btn"
                                onClick={() => deleteChat(remove)}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
        
    ); 
}

export default Chat;