import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Pet } from '../../types';
import { usePetStore } from '../../store/petStore';

interface PetCardProps {
  pet: Pet;
}

export function PetCard({ pet }: PetCardProps) {
  const [comment, setComment] = React.useState('');
  const [showComments, setShowComments] = React.useState(false);
  const { toggleLike, addComment } = usePetStore();

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `${pet.name} - ${pet.type}`,
        text: pet.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      addComment(pet.id, comment);
      setComment('');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <img
        src={pet.imageUrl}
        alt={pet.name}
        className="w-full h-64 object-cover"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{pet.name}</h3>
            <p className="text-gray-400">{pet.type}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            pet.status === 'adoption' ? 'bg-green-500' :
            pet.status === 'lost' ? 'bg-orange-500' :
            pet.status === 'stolen' ? 'bg-red-500' : 'bg-yellow-500'
          }`}>
            {pet.status}
          </span>
        </div>

        <p className="text-gray-300 mb-4">{pet.description}</p>

        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
          <button
            onClick={() => toggleLike(pet.id)}
            className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart size={20} />
            <span>{pet.likes || 0}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
          >
            <MessageCircle size={20} />
            <span>{(pet.comments || []).length}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors"
          >
            <Share2 size={20} />
          </button>
        </div>

        {showComments && (
          <div className="mt-4 border-t border-gray-700 pt-4">
            <form onSubmit={handleSubmitComment} className="mb-4">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Agregar un comentario..."
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
              />
            </form>
            <div className="space-y-2">
              {(pet.comments || []).map((comment, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-3">
                  <p className="text-gray-300">{comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}