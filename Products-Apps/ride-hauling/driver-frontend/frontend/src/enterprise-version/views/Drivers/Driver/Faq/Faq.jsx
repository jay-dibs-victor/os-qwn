import React, { useState } from 'react';
import './Faq.css';

const Faq = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            question: "How do I start receiving ride requests?",
            answer: "Once you are logged into the Driver Portal and have completed your onboarding verification, simply toggle your status to 'Online' in the Dashboard. You will instantly start receiving nearby requests."
        },
        {
            question: "When do I get paid?",
            answer: "Queens processes driver earnings every Tuesday. Your total balance for the previous week (Monday to Sunday) will be transferred directly to your registered bank account."
        },
        {
            question: "What should I do in case of an emergency?",
            answer: "In any dangerous situation, use the RED SOS button in your navigation or the SOS page. This triggers an immediate alert to our 24/7 security team and broadcasts your live location."
        },
        {
            question: "How is my driver rating calculated?",
            answer: "Your rating is the average of the last 100 ratings given by passengers. Maintain a high rating to stay eligible for premium corporate ride requests."
        },
        {
            question: "Can I drive for multiple vehicle categories?",
            answer: "Yes, depending on your vehicle model and year, you may be eligible for multiple categories such as Standard, Premium, and Corporate. Check your Profile for vehicle eligibility."
        }
    ];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="faq-page-container animated fadeIn p-t-40">
            <div className="page-header text-center m-b-50">
                <div className="badge bg-primary text-dark m-b-15 font-bold p-x-20 p-y-8" style={{ borderRadius: '50px', background: '#FFB800' }}>DRIVER SUPPORT</div>
                <h1 className="font-40 font-bold text-dark tracking-tight">Got Questions?</h1>
                <p className="text-muted font-16 mx-auto" style={{ maxWidth: '600px' }}>
                    Everything you need to know about driving with Queens. Can't find what you're looking for? Open a support ticket.
                </p>
            </div>

            <div className="row justify-center">
                <div className="col-lg-8">
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className={`faq-item m-b-15 ${activeIndex === index ? 'active' : ''}`}
                                onClick={() => toggleAccordion(index)}
                                style={{ borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--color-border)', background: '#f8fafc' }}
                            >
                                <div className="faq-question p-30 flex-row items-center justify-between">
                                    <h4 className="m-0 font-bold text-dark font-16" style={{ color: activeIndex === index ? '#FFB800' : 'inherit' }}>{faq.question}</h4>
                                    <div className="accordion-icon">
                                        <i className={`md ${activeIndex === index ? 'md-remove' : 'md-add'} text-primary font-24`} style={{ color: '#FFB800' }}></i>
                                    </div>
                                </div>
                                {activeIndex === index && (
                                    <div className="faq-answer p-x-30 p-b-30 animated fadeIn">
                                        <p className="text-muted font-14 m-0 line-height-lg">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="m-t-50 text-center p-40" style={{ borderRadius: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                        <h3 className="text-dark font-bold m-b-10">Still need help?</h3>
                        <p className="text-muted m-b-25">Our dedicated driver support team is available 24/7 to assist you.</p>
                        <div className="flex-row items-center justify-center gap-20">
                            <button className="btn-premium p-x-30">Open Support Ticket</button>
                            <button className="btn-link text-dark font-bold no-decoration hover-underline" style={{ border: 'none', background: 'transparent' }}>Live Chat</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Faq;
