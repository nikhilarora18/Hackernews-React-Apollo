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

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
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
`

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
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
      user {
        id
      }
    }
  }
`

const LinkList: React.FC = () => {

  const _updateCacheAfterVote = (store: any, createVote: any, linkId: string) => {
    const data = store.readQuery({query: FEED_QUERY})

    const votedLink = data.feed.links.find((link: LinkModel) => link.id === linkId)
    votedLink.votes = createVote.link.votes

    store.writeQuery({query: FEED_QUERY, data})
  }

  const _subscribeToNewLinks = (subscribeToMore: any) => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev
        const newLink = subscriptionData.data.newLink
        const exists = prev.feed.links.find(({ id }: LinkModel) => id === newLink.id);
        if (exists) return prev;

        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename
          }
        })
      }
    })
  }

  const _subscribeToNewVotes = (subscribeToMore: any) => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION,
    })
  }

  return (
    <Query<{
      feed: {
        links: LinkModel[]
      }
    }> query={FEED_QUERY}>
      {({loading, error, data, subscribeToMore}) => {
        if (loading) return <div>Fetching</div>
        if (error) return <div>Error</div>
        const linksToRender = data && data.feed.links

        _subscribeToNewLinks(subscribeToMore);
        _subscribeToNewVotes(subscribeToMore);

        return (
          <div>
            {linksToRender?.map((link, index) =>
                <Link
                  key={link.id}
                  index={index}
                    link={link}
                    updateStoreAfterVote={_updateCacheAfterVote}
                  />
              )}
            </div>
          )
      }}
    </Query>
  )
};

export default LinkList;
