/**
 * Admin Post List
 * Manage all posts (view, edit, delete) with bulk operations and server-side pagination
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/services/api';
import { ROUTES, POST_STATUS, PAGINATION } from '@/config/constants';
import { formatDate } from '@/utils/dateFormatter';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const AdminPostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Posts per page
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    loadPosts();
  }, [filter, currentPage]);

  // Reset selection and page when filter changes
  useEffect(() => {
    setSelectedPosts(new Set());
    if (filter !== 'all') {
      setCurrentPage(1);
    }
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: pageSize,
      };
      
      if (filter !== 'all') {
        params.status = filter;
      }

      const postsData = await adminAPI.listPosts(params);

      if (postsData.success) {
        setPosts(postsData.data || []);
        setPagination({
          total: postsData.total || 0,
          page: postsData.page || currentPage,
          limit: postsData.limit || pageSize,
        });
      } else {
        setPosts([]);
        setPagination({
          total: 0,
          page: currentPage,
          limit: pageSize,
        });
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err.message || 'Failed to load posts');
      setPosts([]);
      setPagination({
        total: 0,
        page: currentPage,
        limit: pageSize,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setDeletingPostId(id);
      const result = await adminAPI.deletePost(id);
      if (result.success) {
        toast.success('Post deleted successfully');
        setSelectedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        
        // Reload posts - if current page becomes empty, go to previous page
        const newTotal = pagination.total - 1;
        const newTotalPages = Math.ceil(newTotal / pageSize);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else {
          loadPosts();
        }
      } else {
        toast.error(result.message || 'Failed to delete post');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPosts.size === posts.length && posts.every(post => selectedPosts.has(post.id))) {
      // Deselect all on current page
      setSelectedPosts(prev => {
        const newSet = new Set(prev);
        posts.forEach(post => newSet.delete(post.id));
        return newSet;
      });
    } else {
      // Select all on current page
      setSelectedPosts(prev => {
        const newSet = new Set(prev);
        posts.forEach(post => newSet.add(post.id));
        return newSet;
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) {
      toast.warning('Please select at least one post to delete');
      return;
    }

    const count = selectedPosts.size;
    if (!window.confirm(`Are you sure you want to delete ${count} post${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    try {
      setBulkDeleting(true);
      const deletePromises = Array.from(selectedPosts).map(id => 
        adminAPI.deletePost(id).catch(err => {
          console.error(`Failed to delete post ${id}:`, err);
          return { success: false, id };
        })
      );

      const results = await Promise.all(deletePromises);
      const successCount = results.filter(r => r.success).length;
      const failCount = count - successCount;

      if (successCount > 0) {
        toast.success(`Successfully deleted ${successCount} post${successCount > 1 ? 's' : ''}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to delete ${failCount} post${failCount > 1 ? 's' : ''}`);
      }

      setSelectedPosts(new Set());
      
      // Reload posts - adjust page if current page becomes empty
      const newTotal = pagination.total - successCount;
      const newTotalPages = Math.ceil(newTotal / pageSize);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      } else {
        loadPosts();
      }
    } catch (err) {
      toast.error('An error occurred during bulk delete');
      console.error('Bulk delete error:', err);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedPosts(new Set()); // Clear selection when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(pagination.total / pageSize);
  const isAllSelected = posts.length > 0 && posts.every(post => selectedPosts.has(post.id));
  const hasSelection = selectedPosts.size > 0;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + posts.length, pagination.total);

  if (loading) {
    return <Loading fullScreen message="Loading posts..." />;
  }

  return (
    <>
      <Helmet>
        <title>Manage Posts | Admin</title>
      </Helmet>

      {(deletingPostId || bulkDeleting) && (
        <Loading fullScreen message={bulkDeleting ? `Deleting ${selectedPosts.size} posts...` : "Deleting post..."} />
      )}

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Manage Posts</h1>
            <p className="page-subtitle">Create, edit, and manage your blog posts</p>
          </div>
          <Link to={ROUTES.ADMIN_POST_NEW} className="btn btn-primary">
            <span>➕</span> New Post
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            onClick={() => setFilter('all')}
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter(POST_STATUS.PUBLISHED)}
            className={`filter-tab ${filter === POST_STATUS.PUBLISHED ? 'active' : ''}`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter(POST_STATUS.DRAFT)}
            className={`filter-tab ${filter === POST_STATUS.DRAFT ? 'active' : ''}`}
          >
            Drafts
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {hasSelection && (
          <div className="admin-card" style={{ 
            marginBottom: 'var(--space-4)', 
            padding: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-3)',
              flexWrap: 'wrap'
            }}>
              <span style={{ 
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-primary)'
              }}>
                {selectedPosts.size} post{selectedPosts.size > 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={handleBulkDelete}
              className="btn btn-danger"
              disabled={bulkDeleting}
            >
              {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedPosts.size})`}
            </button>
          </div>
        )}

        {error ? (
          <div className="admin-alert admin-alert-error">
            <p>{error}</p>
            <button onClick={loadPosts} className="btn btn-sm btn-outline">
              Retry
            </button>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="admin-card">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          style={{ cursor: 'pointer' }}
                          title="Select all on this page"
                        />
                      </th>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedPosts.has(post.id)}
                            onChange={() => handleSelectPost(post.id)}
                            style={{ cursor: 'pointer' }}
                          />
                        </td>
                        <td data-label="Title">
                          <Link
                            to={`${ROUTES.ADMIN_POSTS}/${post.id}/edit`}
                            className="table-link"
                          >
                            {post.title}
                          </Link>
                        </td>
                        <td data-label="Status">
                          <span className={`status-badge status-${post.status}`}>
                            {post.status}
                          </span>
                        </td>
                        <td data-label="Category">{post.category || '-'}</td>
                        <td data-label="Date">{formatDate(post.published_at || post.created_at)}</td>
                        <td data-label="Actions">
                          <div className="table-actions">
                            <Link
                              to={`${ROUTES.ADMIN_POSTS}/${post.id}/edit`}
                              className="btn btn-sm btn-outline"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              className="btn btn-sm btn-danger"
                              disabled={deletingPostId === post.id || bulkDeleting}
                            >
                              {deletingPostId === post.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination" style={{ marginTop: 'var(--space-6)' }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-outline"
                >
                  ← Previous
                </button>
                
                {/* Page Numbers */}
                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      // Show first page, last page, current page, and pages around current
                      return (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      );
                    })
                    .map((pageNum, index, array) => {
                      // Add ellipsis if there's a gap
                      const showEllipsisBefore = index > 0 && pageNum - array[index - 1] > 1;
                      return (
                        <span key={pageNum}>
                          {showEllipsisBefore && <span className="pagination-ellipsis">...</span>}
                          <button
                            onClick={() => handlePageChange(pageNum)}
                            className={`btn ${pageNum === currentPage ? 'btn-primary' : 'btn-outline'}`}
                            style={{ minWidth: '40px' }}
                          >
                            {pageNum}
                          </button>
                        </span>
                      );
                    })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-outline"
                >
                  Next →
                </button>
              </div>
            )}

            {/* Pagination Info */}
            <div style={{ 
              textAlign: 'center', 
              marginTop: 'var(--space-4)',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-sm)'
            }}>
              Showing {startIndex + 1} to {endIndex} of {pagination.total} post{pagination.total !== 1 ? 's' : ''}
            </div>
          </>
        ) : (
          <div className="admin-card">
            <div className="empty-state">
              <p>No posts found.</p>
              <Link to={ROUTES.ADMIN_POST_NEW} className="btn btn-primary">
                Create Your First Post
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPostList;
