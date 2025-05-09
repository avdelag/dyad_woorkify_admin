"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

const conversations = [
  { id: 1, name: 'Vendor Alpha', lastMessage: 'Okay, I will check on that.', avatar: '/placeholder-avatar.png', unread: 2 },
  { id: 2, name: 'Service Pro Beta', lastMessage: 'Thanks for the update!', avatar: '/placeholder-avatar.png', unread: 0 },
];

const selectedConversationMessages = [
  { id: 1, sender: 'Vendor Alpha', text: 'Hello Admin, I have a question about my listing.', time: '10:30 AM', own: false },
  { id: 2, sender: 'Admin', text: 'Hi Vendor Alpha, sure, what is your question?', time: '10:32 AM', own: true },
  { id: 3, sender: 'Vendor Alpha', text: 'It is regarding the commission rate for premium services.', time: '10:35 AM', own: false },
];

export default function DashboardMessages() {
  const [selectedConversation, setSelectedConversation] = React.useState(conversations[0]);
  const [newMessage, setNewMessage] = React.useState('');

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col"> {/* Adjust height as needed */}
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <Card className="flex-grow flex overflow-hidden">
        {/* Sidebar de conversaciones */}
        <div className="w-1/3 border-r bg-muted/20 dark:bg-muted/50 overflow-y-auto">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {conversations.map((convo) => (
              <div
                key={convo.id}
                className={`flex items-center p-4 cursor-pointer hover:bg-accent dark:hover:bg-accent/70 ${selectedConversation.id === convo.id ? 'bg-accent dark:bg-accent/70' : ''}`}
                onClick={() => setSelectedConversation(convo)}
              >
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={convo.avatar} alt={convo.name} />
                  <AvatarFallback>{convo.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <p className="font-semibold">{convo.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
                {convo.unread > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {convo.unread}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </div>

        {/* Área de chat */}
        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <CardTitle>{selectedConversation.name}</CardTitle>
                <CardDescription>Online</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto p-6 space-y-4">
                {selectedConversationMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.own ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.own ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.own ? 'text-primary-foreground/80' : 'text-muted-foreground/80'} text-right`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-grow" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}