import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DeferredChatbot from '@/components/chatbot/DeferredChatbot';

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <DeferredChatbot />
    </div>
  );
}