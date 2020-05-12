import React from "react";
import Link, {LinkModel} from "./Link";
import {gql} from "apollo-boost";
import {Query} from "react-apollo";

const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
      }
    }
  }
`

const LinkList: React.FC = () => {
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
              {linksToRender.map(link => <Link key={link.id} link={link}/>)}
            </div>
          )
        }
       return <div>Error</div>
      }}
    </Query>
  )
};

export default LinkList;
