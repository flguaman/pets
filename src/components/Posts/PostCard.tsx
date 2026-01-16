import React from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Phone, 
  DollarSign,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';
import { Post } from '../../types/post';
import { useSettingsStore } from '../../store/settingsStore';
import { useAuthStore } from '../../store/authStore';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  showActions?: boolean;
}

export function PostCard({ post, onEdit, onDelete, showActions = false }: PostCardProps) {
  const { deviceMode } = useSettingsStore();
  const { user } = useAuthStore();
  const isOwner = user?.id === post.user_id;

  const getPostTypeInfo = (type: string) => {
    switch (type) {
      case 'adoption':
        return { label: 'En Adopción', color: 'bg-green-500', icon: '🏠' };
      case 'lost':
        return { label: 'Perdido', color: 'bg-orange-500', icon: '🔍' };
      case 'stolen':
        return { label: 'Robado', color: 'bg-red-500', icon: '🚨' };
      case 'disoriented':
        return { label: 'Desorientado', color: 'bg-yellow-500', icon: '😵' };
      default:
        return { label: 'General', color: 'bg-blue-500', icon: '📝' };
    }
  };

  const typeInfo = getPostTypeInfo(post.type);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleContact = () => {
    if (post.contact_info) {
      if (post.contact_info.includes('@')) {
        window.location.href = `mailto:${post.contact_info}`;
      } else {
        window.location.href = `tel:${post.contact_info}`;
      }
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className={`flex items-center justify-between ${
        deviceMode === 'mobile' ? 'p-3' : 'p-4'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-lg">{typeInfo.icon}</span>
          <div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Calendar size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {showActions && isOwner && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={() => onEdit(post)}
                className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(post.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pet Info (if linked to a pet) */}
      {post.pet && (
        <div className={`border-b border-gray-700 ${
          deviceMode === 'mobile' ? 'px-3 pb-3' : 'px-4 pb-4'
        }`}>
          <div className="flex items-center gap-3">
            <img
              src={post.pet.image_url}
              alt={post.pet.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h4 className="font-medium text-white">{post.pet.name}</h4>
              <p className="text-sm text-gray-400">{post.pet.type} • {post.pet.breed}</p>
            </div>
          </div>
        </div>
      )}

      {/* Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className={`w-full object-cover ${
            deviceMode === 'mobile' ? 'h-48' : 'h-64'
          }`}
        />
      )}

      {/* Content */}
      <div className={deviceMode === 'mobile' ? 'p-3' : 'p-4'}>
        <h3 className={`font-bold mb-2 ${
          deviceMode === 'mobile' ? 'text-base' : 'text-lg'
        }`}>
          {post.title}
        </h3>
        
        <p className={`text-gray-300 mb-4 ${
          deviceMode === 'mobile' ? 'text-sm' : 'text-base'
        }`}>
          {post.description}
        </p>

        {/* Additional Info */}
        <div className="space-y-2 mb-4">
          {post.location && (
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={14} />
              <span className="text-sm">{post.location}</span>
            </div>
          )}
          
          {post.reward && (
            <div className="flex items-center gap-2 text-green-500">
              <DollarSign size={14} />
              <span className="text-sm font-medium">Recompensa: {post.reward}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
              <Heart size={18} />
              <span className="text-sm">Me gusta</span>
            </button>
            
            <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
              <MessageCircle size={18} />
              <span className="text-sm">Comentar</span>
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors"
            >
              <Share2 size={18} />
              <span className="text-sm">Compartir</span>
            </button>
          </div>

          {post.contact_info && (
            <button
              onClick={handleContact}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Phone size={16} />
              <span className="text-sm">Contactar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}