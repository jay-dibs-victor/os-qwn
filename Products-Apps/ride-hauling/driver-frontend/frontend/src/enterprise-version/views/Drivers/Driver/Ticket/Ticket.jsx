import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useUIStore } from '../../../../core/store/useUIStore';
import './Ticket.css';

const TicketRequest = () => {
    const { addToast } = useUIStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formik = useFormik({
        initialValues: {
            category: 'General Enquiries',
            subject: '',
            description: '',
            attachment: null
        },
        validationSchema: Yup.object({
            subject: Yup.string().required('Required'),
            description: Yup.string().min(20, 'Please provide more details').required('Required'),
        }),
        onSubmit: (values) => {
            setIsSubmitting(true);
            setTimeout(() => {
                setIsSubmitting(false);
                addToast('Support ticket created successfully. We will contact you soon.', 'success');
                formik.resetForm();
            }, 2000);
        }
    });

    return (
        <div className="ticket-page-container animated fadeIn p-t-40">
            <div className="page-header m-b-40">
                <h1 className="font-32 font-bold text-dark tracking-tight">Support Desk</h1>
                <p className="text-muted font-16">Submit your inquiries, technical issues or feedback directly to our team.</p>
            </div>

            <div className="row">
                <div className="col-lg-7">
                    <div className="card-box shadow-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '40px' }}>
                        <div className="form-section-title font-12 font-bold uppercase tracking-widest text-primary m-b-30" style={{ color: '#FFB800' }}>New Ticket</div>

                        <form onSubmit={formik.handleSubmit}>
                            <div className="form-group m-b-20">
                                <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Support Category</label>
                                <select {...formik.getFieldProps('category')} className="form-control premium-input">
                                    <option>General Enquiries</option>
                                    <option>Technical Support</option>
                                    <option>Payment & Wallet Issues</option>
                                    <option>Account Verification</option>
                                    <option>Feedback</option>
                                </select>
                            </div>

                            <div className="form-group m-b-20">
                                <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Subject</label>
                                <input 
                                    {...formik.getFieldProps('subject')} 
                                    className="form-control premium-input" 
                                    placeholder="e.g. Trouble updating profile photo"
                                />
                                {formik.touched.subject && formik.errors.subject && <div className="text-danger font-11 m-t-5">{formik.errors.subject}</div>}
                            </div>

                            <div className="form-group m-b-25">
                                <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Detailed Description</label>
                                <textarea 
                                    {...formik.getFieldProps('description')} 
                                    className="form-control premium-input" 
                                    rows="6" 
                                    placeholder="Provide as much detail as possible..."
                                ></textarea>
                                {formik.touched.description && formik.errors.description && <div className="text-danger font-11 m-t-5">{formik.errors.description}</div>}
                            </div>

                            <div className="form-group m-b-35">
                                <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Attachment (Optional)</label>
                                <div className="file-upload-wrapper glass p-20 text-center" style={{ borderRadius: '16px', border: '2px dashed #ddd', background: '#f9f9f9', position: 'relative' }}>
                                    <i className="md md-attach-file font-32 text-muted m-b-10"></i>
                                    <p className="text-muted font-13 m-b-15">Attach screenshots or documents</p>
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => formik.setFieldValue('attachment', e.currentTarget.files[0])} />
                                    {formik.values.attachment && <p className="text-primary font-bold">{formik.values.attachment.name}</p>}
                                </div>
                            </div>

                            <button type="submit" className="btn-premium w-full p-y-15" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : 'Create Support Ticket'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="m-l-20">
                        <div className="card-box shadow-md" style={{ borderRadius: '24px', padding: '30px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                            <div className="form-section-title font-12 font-bold uppercase tracking-widest text-primary m-b-25" style={{ color: '#FFB800' }}>Recent Tickets</div>
                            
                            <div className="empty-history text-center p-y-40">
                                <i className="md md-history font-48 text-muted opacity-20 m-b-15"></i>
                                <p className="text-muted font-14">No active support tickets found.</p>
                                <button className="btn-link text-primary font-bold no-decoration hover-underline m-t-10" style={{ border: 'none', background: 'transparent' }}>View Closed Tickets</button>
                            </div>

                            <div className="support-info m-t-30 p-25" style={{ borderRadius: '18px', background: '#f8fafc', border: '1px solid #edf2f7' }}>
                                <h5 className="text-dark font-bold m-b-15">Response Time</h5>
                                <p className="text-muted font-13 m-b-0">Our support team typically responds to all inquiries within <strong>24-48 business hours</strong>. For urgent safety issues, please use the SOS feature instead.</p>
                            </div>
                        </div>

                        <div className="m-t-30 text-center">
                            <img 
                                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800" 
                                style={{ width: '100%', borderRadius: '24px', filter: 'brightness(0.95)' }}
                                alt="Support Team"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketRequest;
