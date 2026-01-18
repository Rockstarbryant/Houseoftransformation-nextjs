import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DeferredChatbot from '@/components/chatbot/DeferredChatbot';

export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main className="flex-grow min-h-screen">
        {children}
      </main>
      <Footer />
      <DeferredChatbot />
    </>
  );
}