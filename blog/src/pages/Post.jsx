import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PortableText } from '@portabletext/react'
import client from '../sanity'

const Post = () => {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const query = `
          *[_type == "post" && slug.current == $slug][0] {
            title,
            slug,
            publishedAt,
            mainImage {
              asset->{
                _id,
                url
              }
            },
            body,
            excerpt
          }
        `
        const result = await client.fetch(query, { slug })
        if (!result) {
          setError('記事が見つかりません')
        } else {
          setPost(result)
        }
      } catch (err) {
        setError('記事の取得に失敗しました')
        console.error('Error fetching post:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug])

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
          <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">記事が見つかりません</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  const components = {
    types: {
      image: ({ value }) => (
        <img
          src={value.asset.url}
          alt={value.alt || ' '}
          className="w-full h-auto rounded-lg my-6"
        />
      ),
    },
    block: {
      h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
      h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3">{children}</h2>,
      h3: ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2">{children}</h3>,
      normal: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-6 text-gray-700">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
      number: ({ children }) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className="mb-1">{children}</li>,
      number: ({ children }) => <li className="mb-1">{children}</li>,
    },
    marks: {
      link: ({ children, value }) => (
        <a
          href={value.href}
          className="text-blue-600 hover:text-blue-800 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
    },
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
        ← 記事一覧に戻る
      </Link>
      
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {post.mainImage && (
          <img
            src={post.mainImage.asset.url}
            alt={post.title}
            className="w-full h-64 md:h-96 object-cover"
          />
        )}
        
        <div className="p-6 md:p-8">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <time className="text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </header>

          <div className="prose prose-lg max-w-none">
            {post.body && <PortableText value={post.body} components={components} />}
          </div>
        </div>
      </article>
    </div>
  )
}

export default Post