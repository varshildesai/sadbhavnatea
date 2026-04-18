import { useState, useEffect } from 'react';
import { MessageSquare, Star, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replyInput, setReplyInput] = useState({});

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/reviews', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}`
        }
      });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      toast.error('Could not load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplyChange = (id, value) => {
    setReplyInput({ ...replyInput, [id]: value });
  };

  const handleReplySubmit = async (id) => {
    if (!replyInput[id] || replyInput[id].trim() === '') return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}/reply`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}` 
        },
        body: JSON.stringify({ reply: replyInput[id] })
      });
      if (!res.ok) throw new Error('Failed to reply');
      toast.success('Reply submitted');
      setReplyInput({ ...replyInput, [id]: '' });
      fetchReviews();
    } catch (err) {
      toast.error('Error replying');
    }
  };

  const handleToggleVisibility = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}/visibility`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}` 
        }
      });
      if (!res.ok) throw new Error('Failed to toggle visibility');
      toast.success('Visibility toggled');
      fetchReviews();
    } catch (err) {
      toast.error('Error toggling visibility');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review FOREVER?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('sadbhavna_token')}` 
        }
      });
      if (!res.ok) throw new Error('Failed to delete review');
      toast.success('Review deleted permanently');
      fetchReviews();
    } catch (err) {
      toast.error('Error deleting review');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><MessageSquare /> Customer Feedback Ratings</h2>
      <div className="space-y-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : reviews.length === 0 ? (
          <p>No feedback available.</p>
        ) : (
          reviews.map(review => (
            <div key={review._id} className="bg-white p-5 rounded-2xl shadow-sm border">
                <div className="flex justify-between items-start mb-2">
                 <div>
                   <h3 className="font-bold text-gray-800">
                     {review.user?.name || 'Anonymous User'} 
                     {review.isHidden && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase font-black uppercase">Hidden</span>}
                   </h3>
                   <div className="flex gap-1 text-yellow-500 mb-1">
                     {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? 'fill-yellow-500' : 'text-gray-300'}/>)}
                   </div>
                   <p className="text-sm font-semibold text-primary">{review.product?.name}</p>
                 </div>
                 <div className="flex flex-col items-end gap-2">
                   <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                   <div className="flex gap-2">
                     <button onClick={() => handleToggleVisibility(review._id)} className={`text-xs px-2 py-1 rounded bg-gray-100 font-bold transition-colors ${review.isHidden ? 'hover:bg-green-100 text-green-700' : 'hover:bg-orange-100 text-orange-700'}`}>
                       {review.isHidden ? 'Publish' : 'Hide'}
                     </button>
                     <button onClick={() => handleDelete(review._id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">
                       Delete
                     </button>
                   </div>
                 </div>
               </div>
               <p className={`mb-4 ${review.isHidden ? 'text-gray-400 italic' : 'text-gray-600'}`}>{review.comment}</p>
               
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                 {review.adminReply ? (
                   <div>
                     <span className="font-bold text-sm text-secondary block mb-1">Your Reply:</span>
                     <p className="text-sm text-gray-700">{review.adminReply}</p>
                   </div>
                 ) : (
                   <div className="flex gap-2">
                     <input 
                       type="text" 
                       placeholder="Write a public reply..."
                       value={replyInput[review._id] || ''}
                       onChange={(e) => handleReplyChange(review._id, e.target.value)}
                       className="flex-1 text-sm p-2 border rounded"
                     />
                     <Button size="sm" onClick={() => handleReplySubmit(review._id)}>Reply</Button>
                   </div>
                 )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
