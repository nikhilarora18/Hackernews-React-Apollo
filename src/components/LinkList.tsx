import React from "react";
import Link, {LinkModel} from "./Link";
import {gql} from "apollo-boost";
import {Query} from "react-apollo";

export const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`

const LinkList: React.FC = () => {

  const _updateCacheAfterVote = (store: any, createVote: any, linkId: string) => {
    const data = store.readQuery({ query: FEED_QUERY })

    const votedLink = data.feed.links.find((link: LinkModel) => link.id === linkId)
    votedLink.votes = createVote.link.votes

    store.writeQuery({ query: FEED_QUERY, data })
  }

  return (
    <Query<{
      feed: {
        links: LinkModel[]
      }
    }> query={FEED_QUERY}>
      {({loading, error, data}) => {
        if (loading) return <div>Fetching</div>
        if (data) {
          const linksToRender = data && data.feed.links

          return (
            <div>
              {linksToRender.map((link, index) =>
                  <Link
                    key={link.id}
                    index={index}
                    link={link}
                    updateStoreAfterVote={_updateCacheAfterVote}
                  />
              )}
            </div>
          )
        }
       return <div>Error</div>
      }}
    </Query>
  )
};

export default LinkList;
