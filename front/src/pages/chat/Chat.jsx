import ChatTextBox from '../../components/chat-text-box/ChatTextBox';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './chat.module.css';

function Chat() {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const location = useLocation();
    const userInput = location.state?.userInput || {};
    const [messages, setMessages] = useState([
        {
            sender: 'user',
            text: '' + userInput,
        },
    ]);
    const bottomRef = useRef(null);

    const addNewMessage = useCallback((userMessage, sender = 'user') => {
        setMessages((prevMessage) => {
            const updatedMessage = [
                ...prevMessage,
                {
                    sender: sender,
                    text: userMessage,
                },
            ];

            return updatedMessage;
        });
    }, []);

    const handleSendMessage = useCallback(
        async (userMessage) => {
            addNewMessage(userMessage);
            setIsLoading(true);

            try {
                const response = await fetch('http://localhost:3000/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: userMessage }),
                });

                const data = await response.json();
                console.log(data.message);

                addNewMessage(data.message, 'bot');
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                setErrors((prevErrors) => [...prevErrors, error.message]);
            }
        },
        [addNewMessage]
    );

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className={styles['chat-container-chat-page']}>
            {messages.length > 0 && (
                <ul className={styles['messages-list']}>
                    {messages.map((message, index) => {
                        const listItem = (
                            <li
                                key={index}
                                className={`${styles['message']} ${
                                    styles[message.sender]
                                }`}
                            >
                                {message.text}
                            </li>
                        );
                        return listItem;
                    })}
                    {isLoading && (
                        <li
                            className={`${styles['message']} ${styles['bot']} ${styles['loading-message']}`}
                        >
                            ⏳ המטוס ממריא...<p>ההודעה בדרך אליך</p>
                        </li>
                    )}
                    <div ref={bottomRef}></div>
                </ul>
            )}
            <div className={styles['chat-text-box-container']}>
                <ChatTextBox onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
}

export default Chat;
