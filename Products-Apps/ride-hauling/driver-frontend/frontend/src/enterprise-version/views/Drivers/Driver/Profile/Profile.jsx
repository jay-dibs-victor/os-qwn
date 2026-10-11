import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '../../../../core/store/useAuthStore';
import { useUpdateProfileMutation } from '../../../../core/hooks/useProfileHooks';
import './Profile.css';

const Profile = () => {
    const { user, fetchGamificationStats } = useAuthStore();
    const { mutate: updateProfile, isPending } = useUpdateProfileMutation();
    const [avatarPreview, setAvatarPreview] = useState(user?.profile || '/assets/images/avatar.png');

    useEffect(() => {
        fetchGamificationStats();
    }, []);

    const formik = useFormik({
        initialValues: {
            certificate: user?.test_certificate || '',
            avatar: user?.profile || '',
            use_coins_for_commissions: user?.use_coins_for_commissions || false,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            firstname: Yup.string().required('Required'),
            lastname: Yup.string().required('Required'),
            username: Yup.string().required('Required'),
            email: Yup.string().email('Invalid email').required('Required'),
            phoneNumber: Yup.string().required('Required'),
        }),
        onSubmit: (values) => {
            updateProfile(values);
        },
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                setAvatarPreview(base64String);
                formik.setFieldValue('avatar', base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="profile-page-container animated fadeIn p-t-40">
            <div className="profile-header m-b-40">
                <h2 className="font-32 font-bold text-dark tracking-tight">Driver Identity</h2>
                <p className="text-muted font-16">Manage your personal information and view your performance stats.</p>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <div className="card-box shadow-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '40px' }}>
                        <form onSubmit={formik.handleSubmit}>
                            <div className="avatar-edit-container m-b-40 flex-row items-center">
                                <div className="relative">
                                    <img 
                                        src={avatarPreview} 
                                        className="img-circle shadow-lg" 
                                        alt="Profile" 
                                        style={{ width: '120px', height: '120px', border: '4px solid #FFB800', objectFit: 'cover' }}
                                        onError={(e) => e.target.src = '/assets/images/avatar.png'}
                                    />
                                    <label htmlFor="avatar-upload" className="absolute" style={{ bottom: '0', right: '0', background: '#FFB800', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '3px solid #ffffff' }}>
                                        <i className="md md-camera-alt text-dark font-18"></i>
                                        <input 
                                            type="file" 
                                            id="avatar-upload" 
                                            hidden 
                                            accept="image/*" 
                                            onChange={handleAvatarChange}
                                        />
                                    </label>
                                </div>
                                <div className="m-l-25">
                                    <h4 className="m-0 font-bold text-dark">Profile Photo</h4>
                                    <p className="m-0 text-muted font-13">Allowed JPG, GIF or PNG. Max size of 2MB</p>
                                </div>
                            </div>

                            <div className="form-section-title font-12 font-bold uppercase tracking-widest text-primary m-b-25" style={{ color: '#FFB800' }}>Personal Details</div>
                            
                            <div className="row">
                                <div className="col-md-6 m-b-20">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">First Name</label>
                                    <input 
                                        {...formik.getFieldProps('firstname')} 
                                        className={`form-control premium-input ${formik.touched.firstname && formik.errors.firstname ? 'is-invalid' : ''}`}
                                    />
                                </div>
                                <div className="col-md-6 m-b-20">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Last Name</label>
                                    <input 
                                        {...formik.getFieldProps('lastname')} 
                                        className="form-control premium-input"
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 m-b-20">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Username</label>
                                    <input 
                                        {...formik.getFieldProps('username')} 
                                        className="form-control premium-input"
                                    />
                                </div>
                                <div className="col-md-6 m-b-20">
                                    <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Phone Number</label>
                                    <input 
                                        {...formik.getFieldProps('phoneNumber')} 
                                        className="form-control premium-input"
                                    />
                                </div>
                            </div>

                            <div className="m-b-30">
                                <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Email Address</label>
                                <input 
                                    {...formik.getFieldProps('email')} 
                                    className="form-control premium-input"
                                    disabled
                                    style={{ opacity: 0.6 }}
                                />
                                <small className="text-muted font-11 m-t-5 block">Email cannot be changed after verification.</small>
                            </div>

                            <div className="form-section-title font-12 font-bold uppercase tracking-widest text-primary m-t-40 m-b-25" style={{ color: '#FFB800' }}>License & Certification</div>
                            <div className="m-b-40">
                                <label className="text-muted font-11 font-bold uppercase tracking-wider m-b-8 block">Test Certificate ID</label>
                                <input 
                                    {...formik.getFieldProps('certificate')} 
                                    className="form-control premium-input"
                                    placeholder="Enter certificate number"
                                />
                            </div>

                            <div className="flex-row justify-end">
                                <button type="submit" className="btn-premium p-x-40" disabled={isPending}>
                                    {isPending ? 'Saving Changes...' : 'Save Profile Changes'}
                                </button>
                            </div>

                            <div className="m-t-40 p-t-30" style={{ borderTop: '1px solid #eee' }}>
                                <div className="form-section-title font-12 font-bold uppercase tracking-widest text-primary m-b-25" style={{ color: '#FFB800' }}>Platform Preferences</div>
                                <div className="flex-row items-center justify-between p-20 glass" style={{ background: '#f9f9f9', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div className="flex-row items-center">
                                        <div className="stats-icon-box flex-row items-center justify-center m-r-20" style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,184,0,0.1)', color: '#FFB800' }}>
                                            <i className="md md-account-balance-wallet font-20"></i>
                                        </div>
                                        <div>
                                            <h5 className="m-0 font-bold text-dark">Commission Split</h5>
                                            <p className="m-0 text-muted font-12">Pay 50 coins surcharge from your TaxiCoins balance per trip remittance.</p>
                                        </div>
                                    </div>
                                    <div className="checkbox checkbox-primary checkbox-switch">
                                        <input 
                                            type="checkbox" 
                                            id="use_coins_for_commissions" 
                                            name="use_coins_for_commissions"
                                            checked={formik.values.use_coins_for_commissions}
                                            onChange={(e) => formik.setFieldValue('use_coins_for_commissions', e.target.checked)}
                                        />
                                        <label htmlFor="use_coins_for_commissions" className="m-0"></label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="card-box shadow-md" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '30px' }}>
                        <div className="form-section-title font-12 font-bold uppercase tracking-widest text-primary m-b-25" style={{ color: '#FFB800' }}>Driver Scorecard</div>
                        
                        <div className="stats-mini-card glass m-b-15 p-20 flex-row items-center" style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', background: '#f9f9f9' }}>
                            <div className="stats-icon-box flex-row items-center justify-center m-r-20" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,184,0,0.1)', color: '#FFB800' }}>
                                <i className="md md-star font-24"></i>
                            </div>
                            <div>
                                <h4 className="m-0 font-bold text-dark font-20">{user?.rating || '5.0'}</h4>
                                <p className="m-0 text-muted font-11 uppercase font-bold tracking-wider">Average Rating</p>
                            </div>
                        </div>

                        <div className="stats-mini-card glass m-b-15 p-20 flex-row items-center" style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', background: '#f9f9f9' }}>
                            <div className="stats-icon-box flex-row items-center justify-center m-r-20" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(30,144,255,0.1)', color: '#1e90ff' }}>
                                <i className="md md-directions-car font-24"></i>
                            </div>
                            <div>
                                <h4 className="m-0 font-bold text-dark font-20">{user?.assigned_car_plate_number || 'No Car Assigned'}</h4>
                                <p className="m-0 text-muted font-11 uppercase font-bold tracking-wider">Active Vehicle</p>
                            </div>
                        </div>

                        <div className="stats-mini-card glass m-b-15 p-20 flex-row items-center" style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', background: '#f9f9f9' }}>
                            <div className="stats-icon-box flex-row items-center justify-center m-r-20" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(46,213,115,0.1)', color: '#2ed573' }}>
                                <i className="md md-verified-user font-24"></i>
                            </div>
                            <div>
                                <h4 className="m-0 font-bold text-dark font-20">{user?.isVerified ? 'Verified' : 'Pending'}</h4>
                                <p className="m-0 text-muted font-11 uppercase font-bold tracking-wider">Account Status</p>
                            </div>
                        </div>

                        <div className="m-t-30 p-25 text-center transition-fast" style={{ background: '#f9f9f9', borderRadius: '20px', border: '1px dashed #ddd' }}>
                            <i className="md md-info-outline text-muted font-24 m-b-15"></i>
                            <p className="text-muted font-13 m-b-20">Interested in joining our premium corporate fleet services?</p>
                            <button className="btn-premium p-y-10 p-x-20 font-12" style={{ background: 'transparent', border: '1px solid #FFB800', color: '#FFB800' }}>Contact Support</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
