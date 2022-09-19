import ReactMarkdown from 'react-markdown'
import CodeBlock from './code-block'
import markdownStyles from './markdown-styles.module.css'

type Props = {
  content: string
}

const PostBody = ({ content }: Props) => {
  return (
    <div className="max-w-2xl mx-auto">
      <ReactMarkdown 
        children={content} 
        className={markdownStyles['markdown']}
        components={CodeBlock}
      /> 
    </div>
  )
}

export default PostBody
