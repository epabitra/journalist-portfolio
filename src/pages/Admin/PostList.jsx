/**
 * Admin Post List
 * Manage all posts (view, edit, delete) with pagination and bulk delete
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminAPI } from '@/services/api';
import { ROUTES, POST_STATUS, PAGINATION } from '@/config/constants';
import { formatDate } from '@/utils/dateFormatter';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const AdminPostList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: PAGINATION.DEFAULT_PAGE_SIZE,
    totalPages: 0,
  });

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    // Update filter from URL if present
    const urlFilter = searchParams.get('filter') || 'all';
    setFilter(urlFilter);
  }, [searchParams]);

  useEffect(() => {
    loadPosts();
  }, [filter, currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedPosts(new Set()); // Clear selections when loading new page

      const params = {
        page: currentPage,
        limit: pagination.limit,
      };
      
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await adminAPI.listPosts(params);
      
      // Handle different response structures
      let postsData = response;
      if (response && typeof response === 'object' && 'data' in response && 'status' in response) {
        postsData = response.data;
      }

      if (postsData && postsData.success) {
        const postsList = postsData.data || [];
        const total = postsData.total || 0;
        const totalPages = Math.ceil(total / pagination.limit);
        
        setPosts(postsList);
        setPagination({
          ...pagination,
          page: currentPage,
          total,
          totalPages,
        });
      } else {
        setPosts([]);
        setPagination({
          ...pagination,
          page: currentPage,
          total: 0,
          totalPages: 0,
        });
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSearchParams({ filter: newFilter, page: '1' });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ filter, page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(posts.map(post => post.id));
      setSelectedPosts(allIds);
    } else {
      setSelectedPosts(new Set());
    }
  };

  const handleSelectPost = (postId) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setDeletingPostId(id);
      
      const result = await adminAPI.deletePost(id);
      
      let resultData = result;
      if (result && typeof result === 'object' && 'data' in result && 'status' in result) {
        resultData = result.data;
      }
      
      if (resultData && resultData.success) {
        // Reload posts - this will show loading state
        await loadPosts();
        // Clear deletion state only after reload completes
        setDeletingPostId(null);
        toast.success('Post deleted successfully');
      } else {
        setDeletingPostId(null);
        toast.error(resultData?.message || 'Failed to delete post');
      }
    } catch (err) {
      setDeletingPostId(null);
      toast.error(err.message || 'Failed to delete post');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) {
      toast.warning('Please select at least one post to delete');
      return;
    }

    const selectedArray = Array.from(selectedPosts);
    const count = selectedArray.length;
    
    if (!window.confirm(`Are you sure you want to delete ${count} post(s)?`)) {
      return;
    }

    try {
      setBulkDeleting(true);
      
      const result = await adminAPI.bulkDeletePosts(selectedArray);
      
      let resultData = result;
      if (result && typeof result === 'object' && 'data' in result && 'status' in result) {
        resultData = result.data;
      }
      
      if (resultData && resultData.success) {
        // Reload posts - this will show loading state
        await loadPosts();
        // Clear deletion state only after reload completes
        setBulkDeleting(false);
        setSelectedPosts(new Set());
        toast.success(resultData.message || `${count} post(s) deleted successfully`);
      } else {
        setBulkDeleting(false);
        toast.error(resultData?.message || 'Failed to delete posts');
      }
    } catch (err) {
      setBulkDeleting(false);
      toast.error(err.message || 'Failed to delete posts');
    }
  };

  const isAllSelected = posts.length > 0 && selectedPosts.size === posts.length;
  const isSomeSelected = selectedPosts.size > 0 && selectedPosts.size < posts.length;

  // Show loading mask during deletion or when reloading after deletion
  const isDeleting = deletingPostId || bulkDeleting;
  const showDeletingMask = isDeleting;

  if (loading && posts.length === 0 && !isDeleting) {
    return <Loading fullScreen message="Loading posts..." />;
  }

  return (
    <>
      <Helmet>
        <title>Manage Posts | Admin</title>
      </Helmet>

      {showDeletingMask && (
        <Loading fullScreen message={bulkDeleting ? "Deleting posts..." : "Deleting post..."} />
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
            onClick={() => handleFilterChange('all')}
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          >
            All Posts
          </button>
          <button
            onClick={() => handleFilterChange(POST_STATUS.PUBLISHED)}
            className={`filter-tab ${filter === POST_STATUS.PUBLISHED ? 'active' : ''}`}
          >
            Published
          </button>
          <button
            onClick={() => handleFilterChange(POST_STATUS.DRAFT)}
            className={`filter-tab ${filter === POST_STATUS.DRAFT ? 'active' : ''}`}
          >
            Drafts
          </button>
        </div>

        {/* Bulk Actions Bar */}
        {selectedPosts.size > 0 && (
          <div className="bulk-actions-bar" style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <span style={{ fontWeight: '500' }}>
              {selectedPosts.size} post(s) selected
            </span>
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
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isSomeSelected;
                          }}
                          onChange={handleSelectAll}
                          aria-label="Select all posts"
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
                            aria-label={`Select ${post.title}`}
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

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="pagination" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '2rem',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="btn btn-sm btn-outline"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-sm btn-outline"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-outline'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="btn btn-sm btn-outline"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={currentPage >= pagination.totalPages}
                  className="btn btn-sm btn-outline"
                >
                  Last
                </button>
                
                <span style={{ marginLeft: '1rem', color: '#666' }}>
                  Page {currentPage} of {pagination.totalPages} ({pagination.total} total)
                </span>
              </div>
            )}
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
