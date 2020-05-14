// Copyright (c) 2020 by Audere
//
// Use of this source code is governed by an LGPL-3.0 license that
// can be found in the LICENSE file distributed with this file.
import { Theme, createStyles, makeStyles } from "@material-ui/core";

import Asset from "components/ui/Asset";
import { Button } from "../ui/Buttons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
import PageContent from "../ui/PageContent";
import PageHeader from "../ui/PageHeader";
import { ROUTE_DEFINITIONS } from "routes/routes";
import React from "react";

const style = makeStyles((theme: Theme) =>
  createStyles({
    nextButton: {
      minWidth: "185px",
      margin: "40px",
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
    },
    text: {
      marginTop: "40px",
    },
    imageGroup: {
      borderRadius: "10px",
      border: `3px solid ${theme.palette.primary.main}`,
      marginTop: "20px",
      padding: "20px",
      maxWidth: "600px",
    },
    imageGroupTitle: {
      fontSize: "1.2em",
      fontWeight: 500,
      textAlign: "center",
    },
    imageGroupSubtitle: {
      fontWeight: 500,
      textAlign: "center",
      marginBottom: "20px",
    },
    imageGroupAssets: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingLeft: "20px",
      paddingRight: "20px",
      paddingTop: "10px",
      paddingBottom: "10px",
    },
    leadingImage: {
      display: "block",
      marginLeft: "auto",
      marginRight: "auto",
    },
  })
);

interface ImageGroupProps {
  title: string;
  subtitle: string;
  imgs: {
    img: string;
    alt: string;
  }[];
}

const ImageGroup = (props: ImageGroupProps) => {
  const styles = style();
  const { title, subtitle, imgs } = props;
  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      className={styles.imageGroup}
    >
      <Grid item xs={9}>
        <p className={styles.imageGroupTitle}>{title}</p>
      </Grid>
      <Grid item xs={9}>
        <p className={styles.imageGroupSubtitle}>{subtitle}</p>
      </Grid>
      <Grid
        container
        spacing={3}
        direction="row"
        justify="center"
        alignItems="center"
      >
        {imgs.map(img => (
          <Grid item xs={3} key={img.img + "grid"}>
            <Asset
              height={96}
              width={96}
              alt={img.alt}
              src={img.img}
              key={img.img + "asset"}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default () => {
  const styles = style();

  return (
    <PageContent>
      <PageHeader title="Clean up the test" />
      <div className="container">
        <Asset
          className={styles.leadingImage}
          height={180}
          width={290}
          alt="Image of a soap dispenser and a hand."
          src="handwashing.png"
        />
        <p className={styles.text}>
          You completed your at-home COVID-19 test. Clean it up and toss
          remaining items in the bin. Interested in learning more about
          COVID-19? Take a look at the following tips and information from the
          NHS.
        </p>
        <Grid
          container
          spacing={3}
          direction="column"
          justify="center"
          alignItems="center"
        >
          <ImageGroup
            title="COVID-19 Treatment"
            subtitle="How to treat symptoms"
            imgs={[
              { img: "drinkfluids.png", alt: "Image of cup of fluid." },
              { img: "getrest.png", alt: "Image of person sleeping." },
              { img: "staywarm.png", alt: "Image of heater." },
            ]}
          />
          <ImageGroup
            title="Preventing COVID-19"
            subtitle="10 tips to fight COVID-19"
            imgs={[
              { img: "fluvaccine.png", alt: "Image of a syringe." },
              { img: "keepclean.png", alt: "Image of spray bottle." },
              { img: "washhands.png", alt: "Image of washing hands." },
            ]}
          />
          <ImageGroup
            title="COVID-19 Symptoms"
            subtitle="Understand the symptoms of COVID-19"
            imgs={[
              { img: "headache.png", alt: "Image of a headache." },
              { img: "runnynose.png", alt: "Image of a runny nose." },
              { img: "fever.png", alt: "Image of a thermometer in a head." },
            ]}
          />
        </Grid>
        <Link to={ROUTE_DEFINITIONS.CHOOSEPROFILE.path}>
          <Button className={styles.nextButton} size="large">
            <span>Return Home</span>
            <span className="icon is-medium">
              <FontAwesomeIcon icon="home" />
            </span>
          </Button>
        </Link>
      </div>
    </PageContent>
  );
};
