# 💬 Real-Time Chat Application

A modern, feature-rich real-time chat application built with Next.js, TypeScript, Convex, and Clerk. This project was created as part of the TARS Full-Stack Engineer Internship Coding Challenge 2026.


## 🚀 Live Demo

- **Live Application:** [https://realtime-chat-orcin.vercel.app/](https://realtime-chat-orcin.vercel.app/)
- **Video Walkthrough:** [https://www.loom.com/share/0025c5592cbc439d8a52d44ed4a22aac](https://www.loom.com/share/0025c5592cbc439d8a52d44ed4a22aac)
- **GitHub Repository:** [https://github.com/Sufalthakre18/realtime-chat-nextjs-convex](https://github.com/Sufalthakre18/realtime-chat-nextjs-convex)

## ✨ Features

### Core Features (Mandatory)

✅ **1. Authentication**
- Clerk-powered authentication with email and social login
- User profiles stored in Convex database
- Secure session management

✅ **2. User Discovery & Search**
- Real-time user list with search functionality
- Filter users by name as you type
- One-click conversation creation

✅ **3. Real-Time Messaging**
- Instant message delivery using Convex subscriptions
- One-on-one private conversations
- Message preview in conversation list

✅ **4. Smart Timestamps**
- Today's messages show time only (2:34 PM)
- Older messages include date (Feb 15, 2:34 PM)
- Different year messages include year

✅ **5. Empty States**
- Helpful messages for no conversations
- Empty message states
- No search results feedback

✅ **6. Responsive Design**
- Desktop: Sidebar + chat side-by-side
- Mobile: Full-screen conversations with back button
- Seamless breakpoint transitions

✅ **7. Online/Offline Status**
- Real-time green dot indicators
- Updates when users come online/offline
- Presence tracking with Convex

✅ **8. Typing Indicators**
- "User is typing..." with animated dots
- Disappears after 2 seconds of inactivity
- Real-time synchronization

✅ **9. Unread Message Counts**
- Badge showing unread message count
- Auto-clears when conversation opens
- Real-time updates across devices

✅ **10. Smart Auto-Scroll**
- Auto-scrolls to latest message
- Manual scroll detection
- "New messages" button when scrolled up

### Bonus Features (Optional)

✅ **11. Delete Messages**
- Users can delete their own messages
- Soft delete implementation
- Shows "This message was deleted" in italics

✅ **12. Message Reactions**
- React with 5 emojis: 👍 ❤️ 😂 😮 😢
- Toggle reactions on/off
- Shows reaction counts

✅ **13. Loading & Error States**
- Skeleton loaders for data fetching
- Spinners during operations
- Graceful error handling

✅ **14. Group Chat**
- Create multi-user conversations
- Custom group names
- Member count display
- Real-time group messaging

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives

### Backend
- **Convex** - Real-time backend and database
- **Clerk** - Authentication and user management

### Deployment
- **Vercel** - Frontend hosting
- **Convex Cloud** - Backend hosting

## 📁 Project Structure
```
chat-app/
├── convex/                    # Backend functions
│   ├── auth.config.ts        # Clerk authentication config
│   ├── schema.ts             # Database schema
│   ├── users.ts              # User management functions
│   ├── conversations.ts      # Conversation logic
│   ├── messages.ts           # Message handling
│   ├── reactions.ts          # Reaction system
│   ├── typing.ts             # Typing indicators
│   └── http.ts               # Clerk webhook
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── (auth)/          # Authentication pages
│   │   ├── (chat)/          # Main chat interface
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   ├── ChatLayout.tsx   # Main layout component
│   │   ├── Sidebar.tsx      # Conversation sidebar
│   │   ├── ChatArea.tsx     # Message display area
│   │   ├── MessageBubble.tsx # Individual message
│   │   ├── MessageInput.tsx  # Message composition
│   │   ├── ConversationList.tsx
│   │   ├── UserSearch.tsx
│   │   ├── TypingIndicator.tsx
│   │   ├── ReactionPicker.tsx
│   │   └── ...
│   └── lib/
│       └── utils.ts         # Utility functions
├── public/                  # Static assets
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Clerk account (free tier)
- Convex account (free tier)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Sufalthakre18/realtime-chat-nextjs-convex.git
cd realtime-chat-nextjs-convex/chat-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Clerk**
- Create account at [clerk.com](https://clerk.com)
- Create new application
- Copy API keys

4. **Set up Convex**
```bash
npx convex dev
```
- Follow prompts to create account
- Note your deployment URL

5. **Configure environment variables**

Create `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret
CLERK_ISSUER_URL=your_clerk_issuer_url
```

6. **Configure Clerk Webhook**
- Go to Clerk Dashboard → Webhooks
- Add endpoint: `https://your-deployment.convex.site/clerk-webhook`
- Subscribe to: user.created, user.updated, user.deleted

7. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 🏗️ Key Implementation Details

### Real-Time Architecture
- **Convex Subscriptions**: Automatic real-time updates without polling
- **Optimistic Updates**: Instant UI feedback before server confirmation
- **Efficient Queries**: Single query aggregation for unread counts

### Performance Optimizations
- **Lazy Loading**: Reactions load only on hover
- **Throttled Typing**: Typing indicators limited to once per 10 seconds
- **Smart Caching**: Convex handles intelligent data caching

### State Management
- **Server State**: Convex handles all backend state
- **Client State**: React hooks for UI state
- **Authentication**: Clerk provides auth context

### Database Schema
```typescript
// users - Synced from Clerk
{
  clerkId: string
  email: string
  name: string
  imageUrl?: string
  isOnline: boolean
  lastSeen: number
}

// conversations
{
  name?: string
  isGroup: boolean
  participants: Id<"users">[]
  createdBy: Id<"users">
  lastMessageAt?: number
  lastMessagePreview?: string
}

// messages
{
  conversationId: Id<"conversations">
  senderId: Id<"users">
  content: string
  timestamp: number
  isDeleted: boolean
  readBy: Id<"users">[]
}

// reactions
{
  messageId: Id<"messages">
  userId: Id<"users">
  emoji: string
  timestamp: number
}

// typingIndicators
{
  conversationId: Id<"conversations">
  userId: Id<"users">
  timestamp: number
}
```

## 🎨 Design Highlights

- **Custom Color Palette**: Serene teal and slate design system
- **Smooth Animations**: Fade-ins, hover effects, transitions
- **Accessibility**: ARIA labels, keyboard navigation
- **Professional UI**: Clean, modern interface inspired by popular chat apps

## 🐛 Known Limitations

- Development Clerk keys used (appropriate for internship/demo)
- Online status updates on message send (no constant heartbeat to avoid rate limits)
- Maximum 500 users on free Clerk tier

## 📝 Development Notes

### Challenges Overcome

1. **Concurrent Mutations Error**: Solved by consolidating queries and throttling updates
2. **Real-Time Sync**: Implemented efficient Convex subscription patterns
3. **Mobile Responsiveness**: Custom breakpoint logic for seamless UX

### AI Tools Used

- **Claude AI (Anthropic)**: Code generation, debugging, architecture advice
- All code is fully understood and can be explained in detail

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy automatically

### Convex Deployment
```bash
npx convex deploy
```

## 📊 Features Scorecard

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Complete | Clerk integration |
| User Search | ✅ Complete | Real-time filtering |
| Messaging | ✅ Complete | Instant delivery |
| Timestamps | ✅ Complete | Smart formatting |
| Empty States | ✅ Complete | All 3 types |
| Responsive | ✅ Complete | Mobile + Desktop |
| Online Status | ✅ Complete | Real-time dots |
| Typing Indicator | ✅ Complete | Throttled updates |
| Unread Counts | ✅ Complete | Real-time badges |
| Auto-Scroll | ✅ Complete | Smart detection |
| Delete Messages | ✅ Complete | Soft delete |
| Reactions | ✅ Complete | 5 emojis |
| Loading States | ✅ Complete | Throughout app |
| Group Chat | ✅ Complete | Multi-user support |

**Total: 14/14 Features ✅**

## 👨‍💻 Author

**Sufal Thakre**
- GitHub: [@Sufalthakre18](https://github.com/Sufalthakre18)
- Email: sufalthakre4@gmail.com

## 📄 License

This project was created for the TARS Full-Stack Engineer Internship Coding Challenge 2026.

## 🙏 Acknowledgments

- **TARS** for the internship opportunity
- **Anthropic Claude** for AI-assisted development
- **Convex** for excellent real-time backend
- **Clerk** for seamless authentication
- **Vercel** for hosting platform

## 📞 Contact

For any queries regarding this project:
- Email: sufalthakre4@gmail.com
- LinkedIn: [https://www.linkedin.com/in/sufal-thakre/](https://www.linkedin.com/in/sufal-thakre/)

---

**Built with ❤️ for TARS Internship Challenge 2026**
```
