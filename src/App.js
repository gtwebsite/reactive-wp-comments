import update from 'immutability-helper';
import './App.scss';

import { Context } from "./context";
import CommentItem from "./components/CommentItem"
import CommentForm from "./components/CommentForm";

const { useEffect, useState, useContext, Fragment } = wp.element;

const App = () => {
  const { state, setSetting } = useContext(Context);
  const comments = state.setting.comments;
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetchData({parentId: 0, number: 99});
  }, [])

  useEffect(()=>{
    //console.log(state);
  })

  const fetchData = async ({parentId, index, number}) => {
    try {
      await wp.apiFetch( { path: `/rwpc/v1/comments/${state.setting.post_id}?parent_id=${parentId}&number=${number}` } ).then( posts => {
        const newCollection = comments.length > 0 ? update(comments, {[index]: {children: {$set: posts}}}) : [];
        setLoading(false);
        setSetting({...state.setting, comments: newCollection.length > 0 ? newCollection : posts });
      } ); 
    }catch(e){
      console.log(e);
      setLoading(false);
    }  
  }

  const handleReplies = ({parentId, index}) => {
    if( comments[index].children.length > 0 ) {
      const newCollection = update(comments, {[index]: {children: {$set: []}}});
      setSetting({...state.setting, comments: newCollection.length > 0 ? newCollection : posts });
    }else{
      fetchData({parentId, index});
    }
  }

  return (
    <div id="rwpc">
      <h2>Comments ({state.setting.comments_count})</h2>
      {loading ? (
        <p className="rwpc-loading">Loading comments...</p>
      ) : (
        <Fragment>
          {comments.length > 0 ? (
            <ol className="rwpc-ol">
              {comments.map((c,i)=> <CommentItem key={`comment-list-${i}`} index={i} data={c} replies={handleReplies} />)}
            </ol>
          ) : <p>No comment available.</p>}
        </Fragment>
      )}

      {!state.setting.activeComment ? (
        <div className="rwpc-add-comment">
          <h3>Add your comment</h3>
          <CommentForm parentID={0} />
        </div>
      ) : ''}
    </div>
  )
}

export default App;

