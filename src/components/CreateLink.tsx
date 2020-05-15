import React, {useState} from "react";
import {gql} from "apollo-boost";
import {Mutation} from "react-apollo";
import {useHistory} from "react-router";
import {FEED_QUERY} from "./LinkList";
import {LINKS_PER_PAGE} from "../constants";

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`

const CreateLink: React.FC = () => {
  const [description, setDescription] = useState();
  const [url, setUrl] = useState();

  const history = useHistory();

  return (
    <div>
      <div className="flex flex-column mt3">
        <input
          className="mb2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          type="text"
          placeholder="A description for the link"
        />
        <input
          className="mb2"
          value={url}
          onChange={e => setUrl(e.target.value)}
          type="text"
          placeholder="The URL for the link"
        />
      </div>
      <Mutation
        mutation={POST_MUTATION}
        variables={{description, url}}
        onCompleted={() => history.push('/new/1')}
        update={(store: any, { data: { post } }: any) => {
          const first = LINKS_PER_PAGE;
          const skip = 0;
          const orderBy = 'createdAt_DESC';
          const data = store.readQuery({
            query: FEED_QUERY,
            variables: { first, skip, orderBy }
          });
          data.feed.links.unshift(post);
          store.writeQuery({
            query: FEED_QUERY,
            data,
            variables: { first, skip, orderBy }
          });
        }}
      >
        {(postMutation: any) => <button className="button" onClick={postMutation}>Submit</button>}
      </Mutation>
    </div>
  )
};

export default CreateLink;

