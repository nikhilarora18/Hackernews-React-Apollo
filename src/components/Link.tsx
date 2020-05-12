import React from "react";

export interface LinkModel {
  id: string;
  description: string;
  url: string;
  createdAt: Date;
}

interface LinkProps {
  link: LinkModel;
}

const Link:React.FC<LinkProps> = ({link}) => {
  return (
    <div>
      {link.description} ({link.url})
    </div>
  )
};

export default Link;
