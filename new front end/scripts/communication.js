// Sample conversation data
const conversations = [
    {
        id: 1,
        customer: "Sarah Johnson",
        booking: "#CTMS-1254",
        trip: "Historical Rome Tour",
        lastMessage:
            "Hi, I wanted to ask about the meeting point for the Rome tour...",
        time: "Today, 10:30 AM",
        unread: 2,
        messages: [
            {
                type: "received",
                content:
                    "Hi, I wanted to ask about the meeting point for the Rome tour on June 15th. Is it at the main train station as mentioned in the itinerary?",
                time: "10:30 AM",
            },
            {
                type: "received",
                content: "Also, what time should we arrive?",
                time: "10:31 AM",
            },
            {
                type: "sent",
                content:
                    "Hello Sarah, yes we meet at Roma Termini station at the main entrance. Please arrive by 8:45 AM for a 9:00 AM departure.",
                time: "11:15 AM",
                status: "Delivered",
            },
        ],
    },
    {
        id: 2,
        customer: "Michael Brown",
        booking: "#CTMS-1253",
        trip: "Paris Art Walk",
        lastMessage: "Thanks for confirming my booking!",
        time: "Yesterday, 4:15 PM",
        unread: 0,
        messages: [
            {
                type: "received",
                content: "I just received the booking confirmation. Thanks!",
                time: "4:15 PM",
            },
            {
                type: "sent",
                content:
                    "You're welcome, Michael! We're looking forward to showing you around Paris.",
                time: "4:30 PM",
                status: "Delivered",
            },
        ],
    },
    {
        id: 3,
        customer: "Emma Wilson",
        booking: "#CTMS-1252",
        trip: "Japanese Tea Ceremony",
        lastMessage:
            "Do you have any vegetarian options for the tea ceremony lunch?",
        time: "Yesterday, 11:20 AM",
        unread: 0,
        messages: [
            {
                type: "received",
                content:
                    "Do you have any vegetarian options for the tea ceremony lunch?",
                time: "11:20 AM",
            },
        ],
    },
];

// DOM Elements
const conversationList = document.getElementById("conversation-list");
const messagePanel = document.getElementById("message-panel");
const messageThread = document.getElementById("message-thread");
const recipientInfo = document.getElementById("recipient-info");
const messageComposer = document.getElementById("message-composer");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const archiveBtn = document.getElementById("archive-btn");
const newMessageBtn = document.getElementById("new-message-btn");

// Current selected conversation
let currentConversation = null;

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
    renderConversationList();

    // Add event listeners
    sendBtn.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    newMessageBtn.addEventListener("click", showNewMessageModal);
});

// Render conversation list
function renderConversationList() {
    conversationList.innerHTML = "";

    conversations.forEach((conversation) => {
        const conversationElement = document.createElement("div");
        conversationElement.className = "conversation";
        conversationElement.dataset.id = conversation.id;

        conversationElement.innerHTML = `
            <div class="conversation-header">
                <h3>${conversation.customer}</h3>
                <span class="time">${conversation.time}</span>
            </div>
            <p class="preview">${conversation.lastMessage}</p>
            ${
                conversation.unread > 0
                    ? `<span class="unread-badge">${conversation.unread}</span>`
                    : ""
            }
        `;

        conversationElement.addEventListener("click", () =>
            selectConversation(conversation.id)
        );
        conversationList.appendChild(conversationElement);
    });
}

// Select a conversation
function selectConversation(conversationId) {
    // Remove active class from all conversations
    document.querySelectorAll(".conversation").forEach((conv) => {
        conv.classList.remove("active");
    });

    // Find the selected conversation
    currentConversation = conversations.find((c) => c.id === conversationId);

    if (!currentConversation) return;

    // Add active class to selected conversation
    document
        .querySelector(`.conversation[data-id="${conversationId}"]`)
        .classList.add("active");

    // Update recipient info
    recipientInfo.innerHTML = `
        <h2>${currentConversation.customer}</h2>
        <p>Booking: ${currentConversation.booking} (${currentConversation.trip})</p>
    `;

    // Render messages
    renderMessages();

    // Show message composer
    messageComposer.style.display = "block";

    // Enable archive button
    archiveBtn.disabled = false;

    // Mark messages as read
    currentConversation.unread = 0;
    renderConversationList();
}

// Render messages for the current conversation
function renderMessages() {
    messageThread.innerHTML = "";

    if (!currentConversation || currentConversation.messages.length === 0) {
        messageThread.innerHTML =
            '<div class="empty-state"><p>No messages in this conversation</p></div>';
        return;
    }

    currentConversation.messages.forEach((message) => {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${message.type}`;

        messageElement.innerHTML = `
            <div class="message-content">
                <p>${message.content}</p>
            </div>
            <div class="message-meta">
                <span class="time">${message.time}</span>
                ${
                    message.status
                        ? `<span class="status">${message.status}</span>`
                        : ""
                }
            </div>
        `;

        messageThread.appendChild(messageElement);
    });

    // Scroll to bottom of message thread
    messageThread.scrollTop = messageThread.scrollHeight;
}

// Send a new message
function sendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText || !currentConversation) return;

    // Create new message
    const newMessage = {
        type: "sent",
        content: messageText,
        time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        }),
        status: "Sent",
    };

    // Add to conversation
    currentConversation.messages.push(newMessage);

    // Update UI
    renderMessages();

    // Clear input
    messageInput.value = "";

    // Update last message in conversation list
    currentConversation.lastMessage =
        messageText.length > 50
            ? messageText.substring(0, 50) + "..."
            : messageText;
    currentConversation.time = "Just now";
    renderConversationList();

    // Re-select the conversation to keep it active
    selectConversation(currentConversation.id);
}

// Show new message modal
function showNewMessageModal() {
    const modalHTML = `
        <div class="modal-overlay" id="new-message-modal">
            <div class="new-message-modal">
                <div class="modal-header">
                    <h2>New Message</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <form class="modal-form" id="new-message-form">
                    <div class="form-group">
                        <label for="recipient-select">Select Customer</label>
                        <select id="recipient-select" required>
                            <option value="">Choose a customer</option>
                            <option value="1">Sarah Johnson (Historical Rome Tour)</option>
                            <option value="2">Michael Brown (Paris Art Walk)</option>
                            <option value="3">Emma Wilson (Japanese Tea Ceremony)</option>
                            <option value="4">David Lee (Historical Rome Tour)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="new-message-text">Message</label>
                        <textarea id="new-message-text" rows="4" required></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="cancel-btn">Cancel</button>
                        <button type="submit" class="send-modal-btn">Send</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("new-message-modal");
    const closeBtn = modal.querySelector(".close-modal");
    const cancelBtn = modal.querySelector(".cancel-btn");
    const form = document.getElementById("new-message-form");

    // Close modal handlers
    closeBtn.addEventListener("click", () => modal.remove());
    cancelBtn.addEventListener("click", () => modal.remove());
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.remove();
    });

    // Form submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const recipientId = document.getElementById("recipient-select").value;
        const messageText = document.getElementById("new-message-text").value;

        // In a real app, this would send to server
        console.log(`Sending to ${recipientId}: ${messageText}`);

        // Close modal
        modal.remove();

        // For demo purposes, select the conversation
        if (recipientId) {
            selectConversation(parseInt(recipientId));
        }
    });
}
