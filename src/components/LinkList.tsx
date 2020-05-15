import React from "react";
import Link, {LinkModel} from "./Link";
import {gql} from "apollo-boost";
import {Query} from "react-apollo";
import {useHistory, useLocation, useParams} from "react-router";
import {LINKS_PER_PAGE} from "../constants";

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
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
      count
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

  const location = useLocation();
  const params = useParams();
  const history = useHistory();

  const page = parseInt((params as any)["page"], 10);

  const _updateCacheAfterVote = (store: any, createVote: any, linkId: string) => {
    const isNewPage = location.pathname.includes('new');

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    });

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

  const _getQueryVariables = () => {
    const isNewPage = location.pathname.includes('new');
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    return { first, skip, orderBy };
  }

  const _getLinksToRender = (data: {
    feed: {
      links: LinkModel[]
    }
  }) => {

    if (location.pathname.includes('new')) {
      return data.feed.links;
    }
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  }

  const _nextPage = (data: {
    feed: {
      links: LinkModel[]
      count: number
    }
  }) => {
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      history.push(`/new/${nextPage}`);
    }
  }

  const _previousPage = () => {
    if (page > 1) {
      const previousPage = page - 1;
      history.push(`/new/${previousPage}`);
    }
  }

  return (
    <Query<{
      feed: {
        links: LinkModel[]
        count: number
      }
    }> query={FEED_QUERY} variables={_getQueryVariables()}>
      {({loading, error, data, subscribeToMore}) => {
        if (loading) return <div>Fetching</div>
        if (error) return <div>Error</div>

        _subscribeToNewLinks(subscribeToMore);
        _subscribeToNewVotes(subscribeToMore);

        const linksToRender = data && _getLinksToRender(data);
        const isNewPage = location.pathname.includes('new')
        const pageIndex = (params as any)["page"]
          ? ((params as any)["page"] - 1) * LINKS_PER_PAGE
          : 0
        return (
          <div>
            {linksToRender?.map((link, index) =>
                <Link
                  key={link.id}
                  index={index + pageIndex}
                    link={link}
                    updateStoreAfterVote={_updateCacheAfterVote}
                  />
              )}
            {isNewPage && (
              <div className="flex ml4 mv3 gray">
                {page > 1 && <div className="pointer mr2" onClick={_previousPage}>
                  Previous
                </div>}
                {data && page <= data.feed.count / LINKS_PER_PAGE && (
                  <div className="pointer" onClick={() => data && _nextPage(data)}>
                    Next
                  </div>
                )}
              </div>
            )}
            </div>
          )
      }}
    </Query>
  )
};

export default LinkList;
