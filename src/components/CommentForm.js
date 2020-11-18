import DOMPurify from 'isomorphic-dompurify';
import ReactHtmlParser from 'react-html-parser';
import update from 'immutability-helper';
import { useForm } from "react-hook-form/dist/index.ie11";

import { Context } from "../context";

const { useState, useContext } = wp.element;

const CommentForm = ({ index, postID, parentID, replyTo }) => {
  const { state, setSetting } = useContext(Context);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const user = rwpc_object.user.data;
  const login = rwpc_object.login_url;

  const { register, handleSubmit, errors, setValue } = useForm({
    reValidateMode: 'onSubmit',
    defaultValues: {
      author_name: user.display_name,
      author_email: user.user_email,
      content: replyTo ? `@${replyTo}` : ''
    },
  });

  const afterSubmit = async(data) => {
    setSuccessMsg(data.status === 'hold' ? 'Comment submitted for approval.' : 'Comment submitted successfully.');

    setValue('content', replyTo ? `@${replyTo}` : '');

    setTimeout(()=>{
      setSuccessMsg('');
    }, 3000)

    if( data.status !== 'approved' ) {
      setSubmitting(false);
      setSubmitted(true);
      return;
    }
  
    try{
      await wp.apiFetch( { path: `/rwpc/v1/comments/${data.post}?comment_id=${data.id}` } ).then( posts => {
        let newCollection = [];
        if(data.parent === 0) {
          newCollection = update(state.setting.comments, {
            $unshift: posts
          });
        }else{
          const initialCollection = update(state.setting.comments, {
            [index]: {
              children: {
                $push: posts
              }
            },
          });
          newCollection = update(initialCollection, {
            [index]: {
              replies: {
                $apply: function(x) {
                  return x + 1;
                }
              }
            }
          });
        }

        setSetting({...state.setting, comments: newCollection, comments_count: state.setting.comments_count + 1 });
        setSubmitting(false);
        setSubmitted(true);
  
      } ); 
    }catch(e){
      console.log(e);
      setErrorMsg('Unable to display the new comment.');
      setSubmitting(false);
    }
  }

  const onSubmit = async(commentData) => {
    setSubmitting(true);
    setErrorMsg('');

    const data = {
      ...commentData,
      post: postID ? postID : state.setting.post_id,
      parent: parentID,
    }

    try{
      await wp.apiFetch( { 
        path: `/wp/v2/comments`,
        method: 'POST',
        data
      } ).then(r=>{
        afterSubmit(r);
      });
    }catch(e){
      console.log(e);
      setErrorMsg(e.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="rwpc-form">
      {!user.user_email && 
        <p>Already have an account? <a href={login}>Login here</a>.</p>
      }
      <form onSubmit={handleSubmit(onSubmit)}>
        {errorMsg && <p>{ReactHtmlParser ( DOMPurify.sanitize(errorMsg) )}</p>}
        <fieldset>
          <div className="rwpc-row">
            <div className="rwpc-col-half rwpc-form-group">
              <label htmlFor="author_name" className="rwpc-sr-only">Name</label>
              <input type={user.display_name ? 'hidden' : 'text'} name="author_name" id="author_name" placeholder="Name" ref={register({ required: true })} disabled={submitting} className="rwpc-input" />
              {errors.author_name && <span className="rwpc-error">This field is required</span>}
            </div>
            <div className="rwpc-col-half rwpc-form-group">
              <label htmlFor="author_email" className="rwpc-sr-only">Email</label>
              <input type={user.user_email ? 'hidden' : 'email'} name="author_email" id="author_email" placeholder="Email" ref={register({ required: true })} disabled={submitting} className="rwpc-input" />
              {errors.author_email && <span className="rwpc-error">This field is required</span>}
            </div>
            <div className="rwpc-col-full rwpc-form-group">
              <label htmlFor="author_comment" className="rwpc-sr-only">Comment</label>
              <textarea name="content" id="author_comment" ref={register({ required: true })} disabled={submitting} placeholder="Comment" autoFocus={typeof index !== 'undefined' && true} className="rwpc-input"></textarea>
              {errors.content && <span className="rwpc-error">This field is required</span>}
            </div>
          </div>
        </fieldset>
        <button type="submit" className="rwpc-button rwpc-submit" disabled={submitting}>
          {submitting ? 'Submitting...' : ( state.setting.activeComment === 0 ? 'Post comment' : 'Post reply' )}
        </button>
        {submitted && successMsg && <span className="rwpc-success">{successMsg}</span>}
      </form>
    </div>
  )
}

export default CommentForm;