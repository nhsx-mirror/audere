// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import "../../style/sassStyle";

import React, { ReactNode } from "react";
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import { Button } from "components/ui/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";
import { Link } from "react-router-dom";
import Media from "../ui/Media";
import PageContent from "../ui/PageContent";
import PageHeader from "../ui/PageHeader";
import { ROUTE_DEFINITIONS } from "../../routes/routes";
import getSassStyle from "../../style/sassStyle";

interface TestCheckListProps {
  icon: IconName;
  title: string;
  children: ReactNode;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      fontSize: "20px",
      fontWeight: getSassStyle().strongweight,
    },
    content: {
      marginBottom: getSassStyle().sectionverticalpadding,
    },
  })
);

const TestCheckList = (props: TestCheckListProps) => {
  const { icon, title, children } = props;
  return (
    <div className="container">
      <Media
        image={
          <p className="image is-48x48">
            <span className="icon is-large">
              <FontAwesomeIcon icon={icon} size="3x" />
            </span>
          </p>
        }
      >
        <div className={useStyles().title}>{title}</div>
        <div>{children}</div>
      </Media>
    </div>
  );
};

export default () => {
  return (
    <PageContent>
      <div className="container">
        <PageHeader
          title="Before we start..."
          subtitle="Let's review a few things you will need to perform the test."
        />
        <div className={useStyles().content}>
          <TestCheckList icon="vial" title="A Rapid Diagnostic Test Kit">
            If you do not have a test kit yet, you can get one Open the kit box
            and remove the materials.
            <Link to={ROUTE_DEFINITIONS.ORDERTEST.path}>here</Link>.
          </TestCheckList>
          <br /> <br />
          <TestCheckList icon="camera" title="A Camera On This Device">
            You will need to take a picture of the test kit result for analysis.{" "}
            <br />
            You can test if you are well equiped{" "}
            <Link to={ROUTE_DEFINITIONS.TESTCAMERA.path}>here</Link>.{" "}
          </TestCheckList>
          <br />
          <TestCheckList icon="sun" title="A Well Lit Place">
            Sufficient lighting will be needed, to provide a clear picture of
            the Find a well lit location with a flat service. test result.
            <br /> You can test if you are in a place with enough lights{" "}
            <Link to={ROUTE_DEFINITIONS.TESTCAMERA.path}>here</Link>.
          </TestCheckList>
          <br /> <br />
          <TestCheckList icon="clock" title="About 25 minutes of your time">
            The test kit process takes about 25 minutes from beginning to end,
            make sure you have enough time before to proceed.
          </TestCheckList>
          <br /> <br />
          <TestCheckList
            icon="id-card"
            title="A Personal Identification Document"
          >
            By law, we need to provide accurate information about people using
            an RDT test.
            <br />
            Make sure you have a valid ID for the person passing the test. More
            info <Link to={ROUTE_DEFINITIONS.IDINFO.path}>here</Link>.{" "}
          </TestCheckList>
        </div>
        <Link to={ROUTE_DEFINITIONS.CHOOSEPROFILE.path}>
          <Button size="large">
            <span className="icon is-medium">
              <FontAwesomeIcon icon="check" />
            </span>
            <span>Let's Go!</span>
          </Button>
        </Link>
      </div>
    </PageContent>
  );
};
