import {
  ActionFunction,
  Form,
  LoaderFunction,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from 'remix'
import invariant from 'tiny-invariant'
import { createPost, getPost, Post } from '~/post'

interface PostError {
  title?: boolean
  slug?: boolean
  markdown?: boolean
}

export let loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, 'Expected params.slug')
  return getPost(params.slug)
}

export let action: ActionFunction = async ({ request }) => {
  await new Promise((res) => setTimeout(res, 1000))

  let formData = await request.formData()

  let title = formData.get('title')
  let slug = formData.get('slug')
  let markdown = formData.get('markdown')

  let errors: PostError = {}
  if (!title) errors.title = true
  if (!slug) errors.slug = true
  if (!markdown) errors.markdown = true

  if (Object.keys(errors).length) {
    return errors
  }

  invariant(typeof title === 'string')
  invariant(typeof slug === 'string')
  invariant(typeof markdown === 'string')

  await createPost({ title, slug, markdown })

  return redirect('/admin')
}

export default function EditSlug() {
  let post = useLoaderData<Post>()
  let errors = useActionData()
  let transition = useTransition()

  return (
    <Form method="post">
      <p>
        <label>
          Post Title:
          {errors?.title ? <em>Title is required</em> : null}
          <input type="text" name="title" defaultValue={post.title} />
        </label>
      </p>
      <p>
        <label>
          Post Slug:
          {errors?.slug ? <em>Slug is required</em> : null}
          <input type="text" name="slug" defaultValue={post.slug} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>
        {errors?.slug ? <em>Markdown is required</em> : null}
        <br />
        <textarea
          id="markdown"
          name="markdown"
          rows={20}
          defaultValue={post.body}
        />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? 'Creating...' : 'Create Post'}
        </button>
      </p>
    </Form>
  )
}
