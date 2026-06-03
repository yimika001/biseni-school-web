


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, RefreshCw, Flag } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const QUOTES = [
  "Education is the most powerful weapon to change the world.", "Success is not final, failure is not fatal.", "Believe you can and you're halfway there.", "Dream big. Work hard. Stay focused.",
  "Your attitude determines your altitude.", "The future belongs to those who prepare for it.", "Strive for progress, not perfection.", "Learning is a treasure that follows its owner.",
  "Mistakes are proof that you are trying.", "Knowledge is power.", "Be the change you wish to see.", "Never stop questioning.", "Practice makes progress.",
  "Every expert was once a beginner.", "Don't let yesterday take up too much of today.", "Action is the foundational key to success.", "Stay hungry, stay foolish.",
  "The beautiful thing about learning is nobody can take it away.", "You are braver than you believe.", "Keep your eyes on the stars.", "Focus on the step in front of you.",
  "Turn your wounds into wisdom.", "Opportunities don't happen, you create them.", "Work hard in silence, let success make the noise.", "It always seems impossible until it's done.",
  "Do what you can with what you have.", "Small steps lead to big results.", "Fall seven times, stand up eight.", "Don't watch the clock; do what it does. Keep going.",
  "The only limit to our realization of tomorrow is our doubts of today.", "Your potential is endless.", "Keep going, keep growing.", "Education is life itself.",
  "The roots of education are bitter, but the fruit is sweet.", "One book, one pen, one child can change the world.", "Choose to be extraordinary.", "Hard work beats talent.",
  "Excellence is not an act, but a habit.", "Change your thoughts, change your world.", "Your education is your passport to the future.", "Be a student of life.",
  "Curiosity is the wick in the candle of learning.", "Never settle for average.", "Your voice matters.", "You belong here.", "Challenge yourself every day.",
  "Success starts with a single step.", "Knowledge is the key to freedom.", "Think outside the box.", "Be kind to your mind.", "Believe in your potential.",
  "Make today a masterpiece.", "Discipline is the bridge to goals.", "Never give up on your dreams.", "Read more, know more.", "Intelligence plus character is the goal.",
  "Aim for the moon.", "Learning is a lifelong journey.", "Stay positive, work hard, make it happen.", "You are capable of amazing things.", "Focus on your goals.",
  "Build your future.", "Knowledge is the best investment.", "Learn from yesterday, live for today.", "Don't fear failure.", "The best way to predict the future is to create it.",
  "Keep moving forward.", "Growth is painful, but necessary.", "Be proud of your progress.", "The goal is progress, not perfection.", "Stay focused on your journey.",
  "Every day is a chance to learn.", "You have the power to create your reality.", "Your hard work will pay off.", "Be the best version of yourself.", "Dream it, achieve it.",
  "Consistency is the key to mastery.", "The secret of getting ahead is getting started.", "Your time is now.", "Education opens doors.", "Never stop dreaming.",
  "Believe in the power of your ideas.", "Take ownership of your learning.", "Every lesson is a step forward.", "Success is built on daily habits.", "Stay curious.",
  "Your future is bright.", "Unlock your potential.", "Be a lifelong learner.", "Your effort defines your results.", "Nothing is impossible.",
  "Keep your dream alive.", "Think critically, live boldly.", "Knowledge leads to opportunity.", "Success is within reach.", "Your journey is unique.",
  "Persistence is key.", "Focus on the positive.", "Be brave.", "Great things take time.", "Keep shining.",
  "Believe in yourself.", "You are enough.", "Make it count.", "Stay humble.", "Work smarter.",
  "Always be learning.", "Kindness wins.", "Your potential is unlimited.", "Never stop growing.", "You have a purpose.",
  "Focus on your vision.", "Stay disciplined.", "Be bold.", "Your hard work shows.", "Take action today.",
  "Keep your standards high.", "Learn, unlearn, relearn.", "Stay patient.", "Believe in the process.", "You are a leader.",
  "Never doubt your talent.", "Focus is everything.", "Stay dedicated.", "Your future starts now.", "Be a problem solver.",
  "Keep striving.", "Success loves consistency.", "Never stop exploring.", "Be proactive.", "Knowledge is freedom.",
  "Your attitude is everything.", "Keep pushing forward.", "Believe in the journey.", "Stay focused and win.", "Be excellent.",
  "Your dreams are valid.", "Focus, breathe, achieve.", "Keep your head up.", "Be a visionary.", "You have the strength.",
  "Stay organized.", "Your impact matters.", "Be courageous.", "Keep creating.", "Work with purpose.",
  "Always aim higher.", "Believe in the impossible.", "Stay resilient.", "Be a positive force.", "Your time is valuable.",
  "Keep finding ways.", "Focus on solutions.", "Be adaptable.", "Your dedication inspires.", "Stay on track.",
  "Be a pioneer.", "Keep innovating.", "Success is a choice.", "Your future is yours.", "Believe in tomorrow.",
  "Stay determined.", "Be relentless.", "Keep your focus sharp.", "Your work creates change.", "Be a lighthouse.",
  "Always be prepared.", "Focus on what matters.", "Stay connected to your goals.", "Be a learner for life.", "Your effort counts.",
  "Keep exploring new ideas.", "Success is within your grasp.", "Be a catalyst for good.", "Stay committed.", "Your potential is key.",
  "Keep your spirit strong.", "Focus on the present.", "Be a bridge builder.", "Always move forward.", "Your path is clear.",
  "Keep building your legacy.", "Success is simple, but not easy.", "Be a constant learner.", "Stay true to your vision.", "Your future is waiting.",
  "Stay focused.", "You are a star.", "Work hard.", "Believe.", "Be great.",
  "Keep the faith.", "You got this.", "Stay active.", "Be the best.", "Never quit.",
  "Aim high.", "Stay true.", "Be kind.", "Work well.", "Think big.",
  "Your life matters.", "Keep growing.", "Be a winner.", "Stay sharp.", "Do good.",
  "You are gifted.", "Keep dreaming.", "Be bold.", "Stay calm.", "Work smart.",
  "Believe in you.", "Keep pushing.", "Be a light.", "Stay strong.", "Go for it.",
  "Your best is enough.", "Keep learning.", "Be unique.", "Stay focused.", "Be a hero.",
  "Dream big today.", "Work with heart.", "Stay positive.", "Be a leader.", "Never stop.",
  "You can do it.", "Keep the fire.", "Be a success.", "Stay ready.", "Do your best.",
  "Your time is here.", "Keep striving.", "Be a master.", "Stay humble.", "Work on you.",
  "Believe always.", "Keep moving.", "Be a champion.", "Stay bright.", "Be great."
];

const StudentDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data.profile);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [token]);

  return (
    <div className="p-4 md:p-8 pb-24 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Hi, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-500 italic text-sm">"Education is the most powerful weapon which you can use to change the world."</p>
        </div>
        <button onClick={() => { logout(); navigate('/portal'); }} className="text-xs font-black uppercase text-red-600 bg-red-50 px-4 py-2 rounded-xl">Logout</button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 mb-8 flex gap-4">
        <div className="w-14 h-14 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center font-black">{profile?.class}</div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase">Current Student</p>
          <p className="font-black text-gray-800 uppercase">{profile?.lastName} {profile?.firstName}</p>
          <p className="text-xs text-primary font-bold">{profile?.admissionNumber} | {profile?.department} Dept</p>
        </div>
      </div>

      <div className="mb-6">
        <div onClick={() => navigate('/portal/results')} className="bg-primary p-8 rounded-[2.5rem] text-white cursor-pointer min-h-55 flex flex-col justify-between max-w-lg">
          <BookOpen className="w-10 h-10 mb-4" />
          <h3 className="text-4xl font-black italic">Check<br/>Results</h3>
        </div>
      </div>
      
      <div className="bg-green-50 p-8 rounded-[2.5rem] border border-green-200 mb-6">
        <div className="flex items-center gap-2 mb-4">
            <Flag size={20} className="text-green-800"/>
            <p className="text-xs font-black text-green-800 uppercase">National Anthem</p>
        </div>
        <div className="text-sm font-medium leading-relaxed italic text-green-900">
          <p>Nigeria, we hail thee,<br/>Our own dear native land,<br/>Though tribe and tongue may differ,<br/>In brotherhood we stand.<br/><br/>
          Nigerians all, are proud to serve<br/>Our sovereign Motherland.<br/><br/>
          Our flag shall be a symbol<br/>That truth and justice reign,<br/>In peace or battle honour'd,<br/>And this we count as gain.<br/><br/>
          To hand on to our children<br/>A banner without stain.</p>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-8 rounded-[2.5rem] border border-yellow-100 flex flex-col justify-between">
        <p className="text-lg font-bold text-yellow-950 italic mb-4">"{QUOTES[quoteIndex]}"</p>
        <button onClick={() => setQuoteIndex((p) => (p + 1) % QUOTES.length)} className="flex items-center gap-2 w-max text-[10px] font-black uppercase text-yellow-800 bg-yellow-100 px-4 py-2 rounded-xl">
          <RefreshCw size={12} /> Next Quote
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;



