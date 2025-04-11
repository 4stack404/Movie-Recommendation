import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../context/AppContext';
import { toast } from 'react-toastify';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const { setIsLoggedin, getUserData } = useContext(AppContent);

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Add a small delay to ensure cookie is set
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Get user data first to verify the login worked
                const result = await getUserData();
                if (!result) {
                    throw new Error('Failed to get user data');
                }
                
                setIsLoggedin(true);
                toast.success('Successfully logged in!');
                navigate('/');
            } catch (error) {
                console.error('OAuth callback error:', error);
                toast.error('Login failed. Please try again.');
                navigate('/login');
            }
        };

        handleOAuthCallback();
    }, [navigate, setIsLoggedin, getUserData]);

    return (
        <div className="relative min-h-screen flex items-center justify-center">
            {/* Background Image with Blur */}
            <div 
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("/bg_img.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(8px) brightness(0.7)',
                }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-0" />

            <div className="text-center relative z-10">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-4 text-white">Completing login...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
