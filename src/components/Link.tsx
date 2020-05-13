import React from "react";
import {AUTH_TOKEN} from "../constants";
import {timeDifferenceForDate} from "../utils";
import {gql} from "apollo-boost";
import {Mutation} from "react-apollo";

export interface LinkModel {
  id: string;
  description: string;
  url: string;
  createdAt: Date;
  votes: [];
  postedBy: {name: string, id: string};
}

interface LinkProps {
  link: LinkModel;
  index: number;
  updateStoreAfterVote: (store: any, vote: any, id: string) => void;
}

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
       id
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`

const Link:React.FC<LinkProps> = ({link, index, updateStoreAfterVote}) => {
  const authToken = localStorage.getItem(AUTH_TOKEN);
  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{index + 1}.</span>
        {authToken && (
          <Mutation
            mutation={VOTE_MUTATION}
            variables={{ linkId: link.id }}
            update={(store: any, {data: {vote}}: any) =>
              updateStoreAfterVote(store, vote, link.id)
            }
          >
            {(voteMutation: any) => (
              <div className="ml1 gray f11" onClick={voteMutation}>
                ▲
              </div>
            )}
          </Mutation>
        )}
      </div>
      <div className="ml1">
        <div>
          {link.description} ({link.url})
        </div>
        <div className="f6 lh-copy gray">
          {link.votes.length} votes | by{' '}
          {link.postedBy
            ? link.postedBy.name
            : 'Unknown'}{' '}
          {timeDifferenceForDate(link.createdAt)}
        </div>
      </div>
    </div>
  )
};

export default Link;
