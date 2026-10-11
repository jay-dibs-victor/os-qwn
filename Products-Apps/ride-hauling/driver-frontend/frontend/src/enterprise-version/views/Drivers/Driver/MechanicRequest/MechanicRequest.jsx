import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUIStore } from '../../../../core/store/useUIStore';
import './MechanicRequest.css';

const MechanicRequest = () => {
    const { user } = useAuthStore();
    const { addToast } = useUIStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formik = useFormik({
        initialValues: {
            location: '',
            carBrand: '',
            carModel: '',
            issueDescription: '',
            image: null,
        },
        validationSchema: Yup.object({
            location: Yup.string().required('Required'),
            carBrand: Yup.string().required('Required'),
            carModel: Yup.string().required('Required'),
            issueDescription: Yup.string().min(10, 'Details please!').required('Required'),
        }),
        onSubmit: (values) => {
            setIsSubmitting(true);
            console.log('Repair Request:', values);
            // Simulate API
            setTimeout(() => {
                setIsSubmitting(false);
                addToast('Repair request submitted. A mechanic is being dispatched!', 'success');
                formik.resetForm();
            }, 2000);
        },
    });

    const handleFileChange = (e) => {
        formik.setFieldValue('image', e.currentTarget.files[0]);
    };

    return (
        <div className="mechanic-request-container animated fadeIn p-t-40">
            <div className="page-header m-b-40">
                <h1 className="font-32 font-bold text-dark tracking-tight">Vehicle Support</h1>
                <p className="text-muted font-16">Request immediate roadside assistance or scheduled maintenance.</p>
            </div>

            <div className="row">
                <div className="col-lg-7">
                    <div className="card-box shadow-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '40px' }}>
                        <div className="form-section-title font-12 font-bold uppercase tracking-widest text-primary m-b-30" style={{ color: '#FFB800' }}>Request Details</div>
                        
                        <form onSubmit={formik.handleSubmit}>
                            <div className="form-group m-b-20">
                                <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Current Location</label>
                                <div className="relative">
                                    <input 
                                        {...formik.getFieldProps('location')} 
                                        className="form-control premium-input p-l-40" 
                                        placeholder="Where are you currently?"
                                    />
                                    <i className="md md-my-location absolute" style={{ left: '15px', top: '15px', color: '#FFB800' }}></i>
                                </div>
                                {formik.touched.location && formik.errors.location && <div className="text-danger font-11 m-t-5">{formik.errors.location}</div>}
                            </div>

                            <div className="row">
                                <div className="col-md-6 m-b-20">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Car Brand</label>
                                    <select {...formik.getFieldProps('carBrand')} className="form-control premium-input">
                                        <option value="">Select Brand</option>
                                        <option value="toyota">Toyota</option>
                                        <option value="mercedes">Mercedes Benz</option>
                                        <option value="lexus">Lexus</option>
                                        <option value="bmw">BMW</option>
                                    </select>
                                </div>
                                <div className="col-md-6 m-b-20">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Model / Year</label>
                                    <input {...formik.getFieldProps('carModel')} className="form-control premium-input" placeholder="e.g. Camry 2018" />
                                </div>
                            </div>

                            <div className="form-group m-b-25">
                                <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Issue Description</label>
                                <textarea 
                                    {...formik.getFieldProps('issueDescription')} 
                                    className="form-control premium-input" 
                                    rows="4" 
                                    placeholder="Describe the problem you are experiencing..."
                                ></textarea>
                                {formik.touched.issueDescription && formik.errors.issueDescription && <div className="text-danger font-11 m-t-5">{formik.errors.issueDescription}</div>}
                            </div>

                            <div className="form-group m-b-35">
                                <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Proof Image (Optional)</label>
                                <div className="file-upload-wrapper glass p-20 text-center" style={{ borderRadius: '16px', border: '2px dashed #ddd', background: '#f9f9f9', position: 'relative' }}>
                                    <i className="md md-cloud-upload font-32 text-muted m-b-10"></i>
                                    <p className="text-muted font-13 m-b-15">Click to upload or drag and drop</p>
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    {formik.values.image && <p className="text-primary font-bold">{formik.values.image.name}</p>}
                                </div>
                            </div>

                            <button type="submit" className="btn-premium w-full p-y-15" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending Request...' : 'Dispatch Mechanic Now'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-lg-5">
                    <div className="support-sidebar-wrapper m-l-20">
                        <div className="card-box shadow-md" style={{ borderRadius: '24px', padding: '30px', border: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                            <div className="form-section-title font-12 font-bold uppercase tracking-widest text-primary m-b-25" style={{ color: '#FFB800' }}>Emergency Contact</div>
                            <div className="flex-row items-center m-b-30 p-20" style={{ borderRadius: '18px', background: '#f8fafc' }}>
                                <div className="icon-box-circle bg-danger m-r-20 flex-row items-center justify-center shadow-md" style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ff4757' }}>
                                    <i className="md md-phone-in-talk text-white font-24"></i>
                                </div>
                                <div>
                                    <h4 className="m-0 font-bold text-dark">0800-REPAIR-SOS</h4>
                                    <p className="m-0 text-muted font-11 uppercase font-bold tracking-wider">Direct Dispatch Line</p>
                                </div>
                            </div>

                            <div className="repair-steps m-t-40">
                                <h5 className="text-dark font-bold m-b-20">How it works</h5>
                                <div className="step-item m-b-25 flex-row">
                                    <div className="step-number m-r-15 font-bold text-primary" style={{ color: '#FFB800' }}>01.</div>
                                    <p className="text-muted font-13">Submit your current location and vehicle details above.</p>
                                </div>
                                <div className="step-item m-b-25 flex-row">
                                    <div className="step-number m-r-15 font-bold text-primary" style={{ color: '#FFB800' }}>02.</div>
                                    <p className="text-muted font-13">Our AI matches you with the nearest certified Queens mechanic.</p>
                                </div>
                                <div className="step-item m-b-25 flex-row">
                                    <div className="step-number m-r-15 font-bold text-primary" style={{ color: '#FFB800' }}>03.</div>
                                    <p className="text-muted font-13">Track the mechanic's location in real-time as they approach.</p>
                                </div>
                            </div>
                        </div>

                        <div className="m-t-30">
                            <img 
                                src="https://images.unsplash.com/photo-1487754180451-c456f719c141?auto=format&fit=crop&q=80&w=800" 
                                style={{ width: '100%', borderRadius: '24px', filter: 'grayscale(0.3) contrast(1.1)' }}
                                alt="Mechanic Support"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MechanicRequest;
