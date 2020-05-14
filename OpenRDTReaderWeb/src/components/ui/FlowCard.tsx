// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../style/sassStyle";

import React, { ReactNode, useState } from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core";
import { cx, useAnimateBgAndColor } from "../../style/utils";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { DashboardRoute } from "../../routes/routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { Link } from "react-router-dom";
import Media from "./Media";

const useStyle = makeStyles((theme: Theme) =>
  createStyles({
    FlowCardRoot: {
      minHeight: "175px",
      cursor: "pointer",
    },
  })
);

export interface FlowCardProps {
  icon: IconName;
  children?: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

const FlowCard = (props: FlowCardProps) => {
  const { icon, children, onClick } = props;
  const classes = useStyle();
  const animateBgAndColorClassName = useAnimateBgAndColor().animateBgAndColor;
  const [hover, setHover] = useState(false);

  return (
    <Card
      raised
      className={cx(
        {
          "has-background-link": hover,
          "has-text-white": hover,
        },
        classes.FlowCardRoot,
        animateBgAndColorClassName
      )}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      onClick={onClick}
    >
      <CardContent>
        <Media
          image={
            <p className="image is-48x48">
              <span className="icon is-large">
                <FontAwesomeIcon icon={icon} size="3x" />
              </span>
            </p>
          }
        >
          <p className={cx({ title: true, "has-text-white": hover })}>
            {children}
          </p>
        </Media>
      </CardContent>
    </Card>
  );
};

export default FlowCard;

interface FlowCardLinkRouteProps extends FlowCardProps {
  route: DashboardRoute;
}

export const FlowCardLinkRoute = (props: FlowCardLinkRouteProps) => (
  <Link to={props.route.path}>
    <FlowCard {...props} />
  </Link>
);
