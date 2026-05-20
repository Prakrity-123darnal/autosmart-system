import { useState, useEffect, useCallback } from 'react';
import { Star, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import api from '../services/api';
import { getApiError } from '../utils/getApiError';
import { useAuth } from '../context/AuthContext';
import { useCurrentCustomer } from '../hooks/useCurrentCustomer';

interface ApiCustomer {
  id: number;
  name: string;
}

interface ApiReview {
  id: number;
  customerId: number;
  rating: number;
  comment: string;
  createdAt: string;
  customer?: ApiCustomer;
}

export function Reviews() {
  const { user } = useAuth();
  const { customerId, loading: customerLoading, error: customerError } =
    useCurrentCustomer();
  const isCustomer = user?.role === 'customer';

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiReview[]>('/reviews');
      setReviews(res.data);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to load reviews'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error(customerError ?? 'Customer profile required');
      return;
    }

    try {
      await api.post('/reviews', {
        customerId,
        rating: formData.rating,
        comment: formData.comment,
      });
      toast.success('Review submitted');
      setFormData({ rating: 5, comment: '' });
      setIsModalOpen(false);
      load();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to submit review'));
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onChange?: (rating: number) => void
  ) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={interactive ? 24 : 20}
          className={`${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onChange && onChange(star)}
        />
      ))}
    </div>
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const canWriteReview = isCustomer && !customerLoading && !customerError;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
            ⭐ Reviews & Feedback
          </h1>
          <p className="text-gray-600 mt-1 text-lg">
            {isCustomer ? 'Share your service experience' : 'Customer reviews'}
          </p>
        </div>
        {canWriteReview && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            <Plus size={20} />
            Write Review
          </button>
        )}
      </div>

      {isCustomer && customerError && (
        <Card className="p-4 text-amber-800 bg-amber-50 text-sm">{customerError}</Card>
      )}

      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {review.customer?.name ?? `Customer #${review.customerId}`}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </Card>
          ))}
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <Card className="p-8 text-center">
          <Star className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600">No reviews yet.</p>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Write a Review"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            {renderStars(formData.rating, true, (rating) =>
              setFormData({ ...formData, rating })
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment
            </label>
            <textarea
              required
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder="Share your experience..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-3 rounded-xl hover:shadow-xl font-semibold"
          >
            ⭐ Submit Review
          </button>
        </form>
      </Modal>
    </div>
  );
}
