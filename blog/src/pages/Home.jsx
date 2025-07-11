import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import client from '../sanity'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const query = `
          *[_type == "post"] | order(publishedAt desc) {
            title,
            slug,
            publishedAt,
            mainImage {
              asset->{
                _id,
                url
              }
            },
            excerpt
          }
        `
        const result = await client.fetch(query)
        setPosts(result)
      } catch (err) {
        setError('記事の取得に失敗しました')
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">{error}</p>
          <p className="text-gray-600 mt-2">環境変数が正しく設定されているか確認してください。</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">ブログ</h1>
        <p className="text-gray-600">最新の記事をお楽しみください</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.slug.current} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {post.mainImage && (
              <img
                src={post.mainImage.asset.url}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                <Link
                  to={`/post/${post.slug.current}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
              )}
              <div className="flex items-center justify-between">
                <time className="text-sm text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString('ja-JP')}
                </time>
                <Link
                  to={`/post/${post.slug.current}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  続きを読む →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">記事がありません。</p>
        </div>
      )}
    </div>
  )
}

export default Home