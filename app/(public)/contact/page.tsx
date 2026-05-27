'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { publicApi } from '@/api/public';
import { MapPin, Phone, Mail, Globe, Send, User, MessageSquare, Building2, Smartphone } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [success, setSuccess] = useState(false);

  const contactMutation = useMutation({
    mutationFn: () => publicApi.submitContact(formData),
    onSuccess: () => {
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    },
    onError: () => {
      alert('Failed to send message. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-20 px-6">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Get in Touch</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Have questions about the Spot Matching System? Connect with our experts worldwide or send us a message directly.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-7xl -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                <Building2 className="text-primary" size={24} />
                Headquarters
              </h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Spot-Nordic</p>
                <div className="flex gap-3">
                  <MapPin size={18} className="shrink-0 text-primary mt-0.5" />
                  <p>Spoaholar 4<br/>111 Reykjavik<br/>Iceland</p>
                </div>
                <div className="flex items-center gap-3">
                  <User size={18} className="shrink-0 text-primary" />
                  <p>Contact: Mr. Ingi Karlsson</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="shrink-0 text-primary" />
                  <p>Tel: (+354) 553 4070</p>
                </div>
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="shrink-0 text-primary" />
                  <p>Mobile: (+354) 896 9790</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="shrink-0 text-primary" />
                  <a href="mailto:support@spotmatchingsystem.com" className="hover:text-primary transition-colors">support@spotmatchingsystem.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe size={18} className="shrink-0 text-primary" />
                  <a href="https://www.spot-nordic.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">www.spot-nordic.com</a>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
              <h3 className="text-xl font-bold mb-6">Global Partners</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-3 border-b border-border pb-2">South America</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">CEC Brasil</p>
                    <p>Contact: Mr. Bruno Mortara</p>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-primary" /> (+55) 11 98342 5897
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-primary" />
                      <a href="mailto:bmortara@alumni.usp.br" className="hover:text-primary transition-colors">bmortara@alumni.usp.br</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-primary" />
                      <a href="https://cecbr.com.br/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">cecbr.com.br</a>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3 border-b border-border pb-2">Gulf Region</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Contact: Mr. Kevin Pinto</p>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-primary" /> (+971) 50 8620715
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-primary" />
                      <a href="mailto:kdpinto9@icloud.com" className="hover:text-primary transition-colors">kdpinto9@icloud.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            {success ? (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-12 rounded-2xl text-center border border-green-200 dark:border-green-800 h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-6">
                  <Send className="text-green-600 dark:text-green-300" size={32} />
                </div>
                <h3 className="text-3xl font-bold mb-4">Message Sent!</h3>
                <p className="text-lg opacity-90">Thank you for reaching out. A representative will get back to you shortly.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-8 px-6 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-card border border-border p-8 md:p-10 rounded-2xl shadow-sm space-y-6">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="text-primary" size={24} />
                  Send us a Message
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full p-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:bg-background outline-none transition-all" 
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="w-full p-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:bg-background outline-none transition-all" 
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Subject</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.subject} 
                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                    className="w-full p-3 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:bg-background outline-none transition-all" 
                    placeholder="How can we help?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Message</label>
                  <textarea 
                    required 
                    rows={8} 
                    value={formData.message} 
                    onChange={e => setFormData({...formData, message: e.target.value})} 
                    className="w-full p-4 bg-muted/50 border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:bg-background outline-none transition-all resize-none"
                    placeholder="Type your message here..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={contactMutation.isPending} 
                  className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {contactMutation.isPending ? 'Sending Message...' : (
                    <>
                      Send Message
                      <Send size={20} />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden h-80">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1741.0028249052955!2d-21.82194602334865!3d64.10850238128384!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48d674b0ed1b822d%3A0xc4eb78ce9e9b06ab!2sSp%C3%B3ah%C3%B3lar%204%2C%20111%20Reykjav%C3%ADk%2C%20Iceland!5e0!3m2!1sen!2sus!4v1716805123456!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Spot-Nordic Headquarters Map"
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}