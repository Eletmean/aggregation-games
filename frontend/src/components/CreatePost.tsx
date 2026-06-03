import React, { useState } from 'react';
import { postsAPI } from '../services/api';
import { getAvatarUrl, handleImageError } from '../utils/avatar';

interface CreatePostProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Проверка размера файла (максимум 2MB)
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      const validFiles = files.filter(file => {
        if (file.size > MAX_FILE_SIZE) {
          alert(`Файл ${file.name} превышает 2MB и не будет загружен`);
          return false;
        }
        return true;
      });
      
      const newFiles = [...imageFiles, ...validFiles].slice(0, 10);
      setImageFiles(newFiles);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Введите текст поста');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('privacy', privacy);
      
      // Добавляем только валидные файлы
      for (const file of imageFiles) {
        formData.append('images', file);
      }
      
      console.log('Отправка поста:', { 
        content: content.substring(0, 50), 
        privacy, 
        imagesCount: imageFiles.length,
        totalSize: imageFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024 + 'MB'
      });
      
      const response = await postsAPI.createPost(formData);
      console.log('Пост создан:', response.data);
      
      onPostCreated();
      onClose();
    } catch (err: any) {
      console.error('Ошибка при создании поста:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setError('Ошибка сети. Проверьте соединение или попробуйте файлы меньшего размера.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || 'Ошибка при создании поста');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-post-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Создать пост</h2>
          <button 
            className="modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="create-post-modal-author">
            <img 
              src={getAvatarUrl(currentUser?.avatar)} 
              alt={currentUser?.username}
              className="create-post-modal-avatar"
              onError={handleImageError}
            />
            <div className="create-post-author-info">
              <h3 className="create-post-author-name">{currentUser?.username || 'Пользователь'}</h3>
              <select 
                className="post-privacy-select"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
              >
                <option value="public">Публичный</option>
                <option value="friends">Только друзья</option>
                <option value="donators">Для донатеров</option>
              </select>
            </div>
          </div>
          
          <textarea
            className="create-post-textarea"
            placeholder="Что у вас нового?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
          
          {imagePreviews.length > 0 && (
            <div className="post-photos-preview">
              <h4 className="photos-preview-title">Фотографии ({imageFiles.length}/10)</h4>
              <div className="photos-preview-grid">
                {imagePreviews.map((url, index) => (
                  <div key={index} className="photo-preview-item">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <button 
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="create-post-modal-actions">
            <div className="modal-action-buttons">
              <label className="modal-action-btn">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <span className="modal-action-icon">📷</span>
                Фото
              </label>
              {imageFiles.length > 0 && (
                <span className="files-size-info">
                  Общий размер: {(imageFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(2)}MB
                </span>
              )}
            </div>
            
            <div className="modal-submit-actions">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Отмена
              </button>
              <button 
                type="submit"
                className="btn btn-primary"
                disabled={loading || !content.trim()}
              >
                {loading ? 'Публикация...' : 'Опубликовать'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;