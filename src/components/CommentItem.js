import DOMPurify from 'isomorphic-dompurify';
import ReactHtmlParser from 'react-html-parser';
import classnames from 'classnames';
import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { Context } from "../context";
import CommentForm from "./CommentForm";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

const { useState, useContext, Fragment } = wp.element;

const CommentItem = ({index, data, replies}) => {
  const { state, setSetting } = useContext(Context);
  const [list, showList] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState('');

  const commentID = parseInt(data.comment_ID);
  const author = data.comment_author_url ? <a href={data.comment_author_url}>{data.comment_author} {data.is_author ? '(author)' : ''}</a> : `${data.comment_author} ${data.is_author ? '(author)' : ''}`;

  const toggleReply = () => {
    setSetting({...state.setting, activeComment: state.setting.activeComment === commentID ? 0 : parseInt(data.comment_ID) });
  }

  const toggleList = () => {
    showList(!list);
  }

  const handleReplies = ({index}) => {
    setLoading(true);
    toggleList();
    replies({parentId: commentID, index});
  }

  return (
    <li className="rwpc-li">
      <article className={classnames( 'rwpc-article', {
        'rpwc-is-author': data.is_author
      })}>
        <blockquote className="rwpc-quote">
          {ReactHtmlParser ( DOMPurify.sanitize(data.rendered) )}
          <footer className="rwpc-quote-footer">
            <img src={data.comment_author_avatar} alt={`${data.comment_author} avatar`} className="rwpc-thumbnail" />{author} |&nbsp;

            {dayjs.tz(data.comment_date, 
              rwpc_object.utc).fromNow()} |&nbsp;
            {
              data.comment_parent === '0' && data.replies !== 0 &&
              <Fragment>
                <a href="#" 
                  onClick={e=>{
                    e.preventDefault();
                    handleReplies({index});
                  }}
                >Replies ({data.replies})</a> |&nbsp;
              </Fragment>
            }

            <a href="#"
              onClick={(e)=>{
                e.preventDefault();
                toggleReply();
                setReplyTo(data.comment_parent !== '0' ? `${data.comment_author} ` : '');
              }}
            >{state.setting.activeComment === commentID ? 'Cancel reply' : 'Reply'}</a>
          </footer>
        </blockquote>
        {state.setting.activeComment === commentID && <CommentForm index={index} postID={data.comment_post_ID} parentID={data.comment_ID} replyTo={replyTo} />}
      </article>
      {loading && list && data.children.length === 0 ? <p className="rwpc-loading">Loading replies...</p> : ''}
      {
        data.children.length > 0 && 
        <ol className="rwpc-ol">
          {data.children.map((c,i)=> <CommentItem index={index} key={`comment-list-${i}`} data={c} />)}
        </ol>
      }
    </li>
  )
}

export default CommentItem;