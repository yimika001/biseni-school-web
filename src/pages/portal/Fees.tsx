import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, Receipt } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

interface StudentProfile {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: string;
  feesStatus: 'Paid' | 'Pending' | 'Part-Payment';
}

const FeesStatus = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(response.data.profile);
      } catch (error) {
        console.error('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Paid':
        return {
          label: 'Fees Cleared',
          desc: 'Your school fees are fully paid for this term.',
          bg: 'bg-green-50 border-green-100',
          textColor: 'text-green-700',
          icon: <CheckCircle2 size={40} className="text-green-500" />,
          badgeBg: 'bg-green-100 text-green-700',
        };
      case 'Pending':
        return {
          label: 'Payment Pending',
          desc: 'Your school fees have not been paid. Please visit the bursar.',
          bg: 'bg-red-50 border-red-100',
          textColor: 'text-red-700',
          icon: <AlertCircle size={40} className="text-red-500" />,
          badgeBg: 'bg-red-100 text-red-700',
        };
      case 'Part-Payment':
        return {
          label: 'Part Payment Made',
          desc: 'A partial payment has been recorded. Outstanding balance remains.',
          bg: 'bg-orange-50 border-orange-100',
          textColor: 'text-orange-700',
          icon: <AlertCircle size={40} className="text-orange-500" />,
          badgeBg: 'bg-orange-100 text-orange-700',
        };
      default:
        return {
          label: 'Unknown',
          desc: '',
          bg: 'bg-gray-50 border-gray-100',
          textColor: 'text-gray-700',
          icon: <CreditCard size={40} className="text-gray-400" />,
          badgeBg: 'bg-gray-100 text-gray-700',
        };
    }
  };

  const statusInfo = getStatusInfo(profile?.feesStatus || '');

  return (
    <div className="p-4 md:p-8 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 uppercase">Financial Status</h1>
        <p className="text-gray-500 text-sm">View your current fees status for this academic session.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <p className="font-bold">Loading fees information...</p>
        </div>
      ) : (

        <>
          {/* Status Card */}
          <div className={`rounded-3xl border p-8 mb-8 flex flex-col md:flex-row items-center gap-6 ${statusInfo.bg}`}>
            {statusInfo.icon}
            <div className="text-center md:text-left">
              <h2 className={`text-2xl font-black uppercase ${statusInfo.textColor}`}>
                {statusInfo.label}
              </h2>
              <p className="text-gray-600 text-sm mt-1">{statusInfo.desc}</p>
              {profile && (
                <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                  <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-gray-700 border">
                    {profile.firstName} {profile.lastName}
                  </span>
                  <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-gray-700 border">
                    {profile.admissionNumber}
                  </span>
                  <span className="text-xs font-bold bg-white px-3 py-1 rounded-full text-gray-700 border">
                    Class {profile.class}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusInfo.badgeBg}`}>
                    {profile.feesStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm mb-8">
            <div className="p-6 border-b border-gray-50 flex items-center gap-2">
              <Receipt size={18} className="text-primary" />
              <h3 className="font-bold text-gray-800">Standard Fee Structure</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr className="text-[10px] font-bold text-gray-400 uppercase">
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Amount (₦)</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { description: 'Tuition Fee', amount: '120,000' },
                    { description: 'Development Levy', amount: '15,000' },
                    { description: 'PTA Levy', amount: '5,000' },
                    { description: 'ICT/Computer Levy', amount: '3,000' },
                    { description: 'Examination Levy', amount: '7,000' },
                  ].map((item) => (
                    <tr key={item.description} className="hover:bg-gray-50/50">
                      <td className="px-6 py-5 text-sm font-bold text-gray-700">{item.description}</td>
                      <td className="px-6 py-5 text-sm font-black text-center">{item.amount}</td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${
                          profile?.feesStatus === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {profile?.feesStatus === 'Paid'
                            ? <><CheckCircle2 size={12} /> Paid</>
                            : <><AlertCircle size={12} /> Pending</>
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Note */}
          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="bg-primary text-white p-3 rounded-2xl shrink-0">
                <CreditCard size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Need to make a payment?</h4>
                <p className="text-xs text-gray-500">
                  Visit the school bursar's office or contact the admin for payment guidance.
                </p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bursar's Office</p>
              <p className="font-black text-primary">Monday – Friday · 8am – 2pm</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FeesStatus;