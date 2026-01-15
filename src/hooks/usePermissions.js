import { useAuth } from '../context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();

  // Blog category permissions
  const canPostBlogCategory = (category) => {
    if (!user) return false;

    const permissions = {
      member: ['testimonies'],
      volunteer: ['testimonies', 'events'],
      usher: ['testimonies', 'events'],
      worship_team: ['testimonies', 'events'],
      pastor: ['testimonies', 'events', 'teaching', 'news'],
      bishop: ['testimonies', 'events', 'teaching', 'news'],
      admin: ['testimonies', 'events', 'teaching', 'news']
    };

    const allowedCategories = permissions[user.role] || [];
    return allowedCategories.includes(category);
  };

  // Get allowed blog categories for user
  const getAllowedBlogCategories = () => {
    if (!user) return [];

    const permissions = {
      member: ['testimonies'],
      volunteer: ['testimonies', 'events'],
      usher: ['testimonies', 'events'],
      worship_team: ['testimonies', 'events'],
      pastor: ['testimonies', 'events', 'teaching', 'news'],
      bishop: ['testimonies', 'events', 'teaching', 'news'],
      admin: ['testimonies', 'events', 'teaching', 'news']
    };

    return permissions[user.role] || [];
  };

  // Check if can post sermons
  const canPostSermon = () => {
    if (!user) return false;
    return ['pastor', 'bishop', 'admin'].includes(user.role);
  };

  // Check if can upload gallery
  const canUploadPhoto = () => {
    if (!user) return false;
    return ['pastor', 'bishop', 'admin'].includes(user.role);
  };

  // Check if can create any blog
  const canPostBlog = () => {
    if (!user) return false;
    return ['member', 'volunteer', 'usher', 'worship_team', 'pastor', 'bishop', 'admin'].includes(user.role);
  };

  // Check if can edit blog (author or admin)
  const canEditBlog = (authorId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.id === authorId;
  };

  // Check if can delete blog (author or admin)
  const canDeleteBlog = (authorId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.id === authorId;
  };

  // Check if is admin
  const isAdmin = () => {
    if (!user) return false;
    return user.role === 'admin';
  };

  return {
    canPostBlog,
    canPostBlogCategory,
    getAllowedBlogCategories,
    canPostSermon,
    canUploadPhoto,
    canEditBlog,
    canDeleteBlog,
    isAdmin,
    user
  };
};