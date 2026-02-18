// import React, { useState } from 'react';
// import { Link, Navigate, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/authContext';
// import toast, { Toaster } from 'react-hot-toast';
// import { doSignInWithEmailAndPassword } from '../firebase/auth';
// import Header from '../components/Header';
// import MainFooter from '../components/MainFooter';

// const Login = () => {
//     const authContext = useAuth();
//     const { userLoggedIn } = authContext || {}; // Prevent destructuring error
//     const [isSignedIn, setIsSignedIn] = useState(false);
//     const navigate = useNavigate();
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (isSignedIn) return; // Prevent multiple clicks

//         const email = e.target[0].value;
//         const password = e.target[1].value;
//         setIsSignedIn(true); // Set loading state

//         try {
//             const user = await doSignInWithEmailAndPassword(email, password);

//             // Store user data in localStorage
//             localStorage.setItem("user", JSON.stringify(user));

//             toast.success("User logged in successfully!");
//             navigate("/");
//         } catch (error) {
//             console.error("Login error:", error.message);
//             toast.error("Login failed! " + error.message);
//             setIsSignedIn(false); // Reset state on failure
//         }
//     };


//     return (
//         <div>
//            <Header/>
//             {userLoggedIn && (<Navigate to={"/"} replace={true} />)}
//             <section class="py-10 bg-gray-50 sm:py-16 lg:py-24">
//                 <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
//                     <div class="max-w-2xl mx-auto text-center">
//                         <h2 class="text-2xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl mt-10">Login Here!</h2>
//                         {/* <p class="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-600">Login to your account</p> */}
//                     </div>
//                     <div class="relative max-w-md mx-auto md:mt-8">
//                         <div class="overflow-hidden bg-white rounded-md shadow-md">
//                             <div class="px-4 sm:px-8 sm:py-7">
//                                 <form action="#" onSubmit={handleSubmit}>
//                                     <div class="space-y-5">
//                                         <div>
//                                             <label for="" class="text-base font-medium text-gray-900"> Email address </label>
//                                             <div class="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
//                                                 <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                                                     <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
//                                                     </svg>
//                                                 </div>

//                                                 <input
//                                                     type="email"
//                                                     name=""
//                                                     id=""
//                                                     placeholder="Enter email to get started"
//                                                     class="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <div class="flex items-center justify-between">
//                                                 <label for="" class="text-base font-medium text-gray-900"> Password </label>

//                                                 {/* <a href="#" title="" class="text-sm font-medium text-orange-500 transition-all duration-200 hover:text-orange-600 focus:text-orange-600 hover:underline"> Forgot password? </a> */}
//                                             </div>
//                                             <div class="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
//                                                 <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                                                     <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                         <path
//                                                             stroke-linecap="round"
//                                                             stroke-linejoin="round"
//                                                             stroke-width="2"
//                                                             d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
//                                                         />
//                                                     </svg>
//                                                 </div>

//                                                 <input
//                                                     type="password"
//                                                     name=""
//                                                     id=""
//                                                     placeholder="Enter your password"
//                                                     class="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <button type="submit" class="cursor-pointer inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 border border-transparent rounded-md focus:outline-none hover:bg-blue-700 focus:bg-blue-700 bg-[#AD0101]">
//                                                 Log in
//                                             </button>
//                                         </div>

//                                         <div class="text-center">
//                                             <p class="text-base text-gray-600">Don’t have an account? <Link to="/register" title="" class="font-medium text-orange-500 transition-all duration-200 hover:text-orange-600 hover:underline">Create a free account</Link></p>
//                                         </div>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>
//             <Toaster />
//             <MainFooter/>
//         </div>
//     );
// };

// export default Login;




import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import toast, { Toaster } from 'react-hot-toast';
import { doSignInWithEmailAndPassword } from '../firebase/auth';
import Header from '../components/Header';
import MainFooter from '../components/MainFooter';

const Login = () => {
    const authContext = useAuth();
    const { userLoggedIn } = authContext || {};
    const [isSigningIn, setIsSigningIn] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSigningIn) return;

        const email = e.target[0].value;
        const password = e.target[1].value;
        setIsSigningIn(true);

        try {
            const user = await doSignInWithEmailAndPassword(email, password);

            // Optional: Store user in localStorage if you really need it
            // (Usually not necessary if using auth context)
            localStorage.setItem('user', JSON.stringify(user));

            toast.success('Logged in successfully!');
            navigate('/');
        } catch (error) {
            console.error('Login error:', error.message);
            toast.error(error.message || 'Login failed!');
            setIsSigningIn(false);
        }
    };

    return (
        <>
            <Header /> {/* Assuming Header accepts menuopen/setMenuOpen props if needed */}

            {/* Add padding-top to push content below fixed header */}
            <section className="pt-32 sm:pt-36 lg:pt-44 bg-gray-50 min-h-screen">
                {userLoggedIn && <Navigate to="/" replace={true} />}

                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="mt-6 sm:mt-10 lg:mt-12 text-2xl font-bold leading-tight text-black sm:text-4xl lg:text-5xl">
                            Login Here!
                        </h2>
                    </div>

                    <div className="relative max-w-md mx-auto mt-3 mb-8 sm:mt-12 lg:mt-16">
                        <div className="overflow-hidden bg-white rounded-md shadow-md">
                            <div className="px-4 py-6 sm:px-8 sm:py-7">
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-5">
                                        {/* Email */}
                                        <div>
                                            <label className="text-base font-medium text-gray-900">Email address</label>
                                            <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="email"
                                                    placeholder="Enter email to get started"
                                                    className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Password */}
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <label className="text-base font-medium text-gray-900">Password</label>
                                                {/* Uncomment if you want Forgot Password link */}
                                                {/* <a href="#" className="text-sm font-medium text-orange-500 hover:text-orange-600 hover:underline">Forgot password?</a> */}
                                            </div>
                                            <div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                                                        />
                                                    </svg>
                                                </div>
                                                <input
                                                    type="password"
                                                    placeholder="Enter your password"
                                                    className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div>
                                            <button
                                                type="submit"
                                                disabled={isSigningIn}
                                                className={`inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#DF263A] ${isSigningIn ? 'opacity-70 cursor-not-allowed' : 'bg-[#DF263A] hover:bg-[#8f0000]'
                                                    }`}
                                            >
                                                {isSigningIn ? 'Logging in...' : 'Log in'}
                                            </button>
                                        </div>

                                        {/* Link to Register */}
                                        <div className="text-center">
                                            <p className="text-base text-gray-600">
                                                Don’t have an account?{' '}
                                                <Link to="/register" className="font-medium text-orange-500 hover:text-orange-600 hover:underline">
                                                    Create a free account
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Toaster position="top-center" />
            <MainFooter />
        </>
    );
};

export default Login;