const presence = new Presence({
    clientId: "785263902321541181" //Presence Application ID on Discord Developers.
  }),
  browsingStamp = Math.floor(Date.now() / 1000);

function unescapeHTML(string: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = string;
  return textarea.value;
}

presence.on("UpdateData", async () => {
  const presenceData: PresenceData = {
      largeImageKey: "linkedin_logo"
    },
    path = document.location.pathname;

  if (document.location.hostname === "www.linkedin.com") {
    //Homepage.
    if (path === "/feed/") {
      presenceData.details = "Browsing Feed.";
      presenceData.startTimestamp = browsingStamp;
    } else if (path.includes("/feed/hashtag/")) {
      //Feed hashtag subsection.
      const hashtagName = document
        .querySelector(
          "div.application-outlet > div.authentication-outlet > div > div > div > div > section > div > div:first-child > div > h3 > span > span:last-child"
        )
        .innerHTML.trim();

      presenceData.details = "Browsing Feed:";
      presenceData.state = `#${unescapeHTML(hashtagName)}.`;
      presenceData.startTimestamp = browsingStamp;
    } else if (path.includes("/feed/")) {
      //Feed follow subsections.
      enum feedSubSection {
        "follow/" = "Browsing suggestions.",
        "following/" = "Viewing Following:",
        "followers/" = "Viewing Followers."
      }
      enum filterType {
        connection = "Connections",
        member = "Members",
        company = "Companies",
        channel = "Hashtags"
      }
      const subSection =
        feedSubSection[
          path.split("/feed/").pop() as keyof typeof feedSubSection
        ];

      presenceData.details = subSection;
      //If the user is on following/ subsection, show the selected filter.
      if (subSection === feedSubSection["following/"]) {
        presenceData.state = `Filtering by ${
          filterType[
            document.location.search
              .split("?filterType=")
              .pop()
              .split("&")
              .shift() as keyof typeof filterType
          ] || "All"
        }.`;
      }
      presenceData.startTimestamp = browsingStamp;
    } else if (path.includes("/mynetwork/")) {
      //My Network section & subsections.
      presenceData.details = "Managing Network:";
      presenceData.startTimestamp = browsingStamp;

      //Invitations subsection.
      if (path.includes("/invitation-manager/"))
        presenceData.state = "Viewing Invitations.";
      //Contacts subsections.
      else if (
        path.includes("/import-contacts/") ||
        path === "/mynetwork/contacts/"
      ) {
        //Contacts homepage.
        if (path === "/mynetwork/contacts/")
          presenceData.state = "Browsing Contacts.";
        //Saved contacts.
        else if (path.endsWith("saved-contacts/"))
          presenceData.state = "Browsing Saved contacts.";
        //Adding contacts.
        else presenceData.state = "Adding Contacts.";
      } else if (path.includes("/colleagues/"))
        //Teammates subsection.
        presenceData.state = "Browsing Colleagues.";
      //My Network subsections with same link path structure.
      else {
        enum networkSubSection {
          "connections/" = "Browsing Connections.",
          "events/" = "Browsing Events.",
          "newsletters/" = "Reading Newsletters."
        }

        presenceData.state =
          networkSubSection[
            path
              .split(/\/[a-z]+-[a-z]+\//)
              .pop() as keyof typeof networkSubSection
          ] || "Homepage.";
      }
    } else if (path.includes("/jobs/") || path === "/my-items/saved-jobs/") {
      //Jobs section.
      presenceData.startTimestamp = browsingStamp;

      //Application settings subsection.
      if (path.endsWith("application-settings/")) {
        presenceData.details = "Editing settings:";
        presenceData.state = "Application.";
      } else {
        //Others subsections.
        presenceData.details = "Browsing Jobs:";

        //Saved Jobs subsection.
        if (path === "/my-items/saved-jobs/")
          presenceData.state = "Saved Jobs.";
        //Searching for a Job subsection.
        else if (path === "/jobs/search/") {
          //Getting user preference for showJobsQuery.
          const showJobsQuery = await presence.getSetting("showJobsQuery");

          if (showJobsQuery) {
            const jobsQuery = decodeURI(
              document.location.search
                .split("keywords=")
                .pop()
                .split("&")
                .shift()
            );

            presenceData.state = `Searching for a "${jobsQuery}" position.`;
          } else presenceData.state = "Searching for a job.";
        } else presenceData.state = "Homepage.";
        //Homepage.
      }
    } else if (path.includes("/interview-prep/")) {
      //Interview prep section (Jobs related section with a different path).
      const interviewPrepArg = document
        .querySelector(
          "div.application-outlet > div.authentication-outlet > main > div > section > section > header > div > div:first-child > h2"
        )
        .innerHTML.trim();

      presenceData.details = "Taking an Interview Prep:";
      presenceData.state = `${unescapeHTML(interviewPrepArg)}.`;
      presenceData.startTimestamp = browsingStamp;
    } else if (path.includes("/messaging/")) {
      //Messaging section.
      presenceData.details = "Messaging:";
      presenceData.startTimestamp = browsingStamp;

      //New message subsection.
      if (path === "/messaging/thread/new/")
        presenceData.state = "Writing a new message.";
      //New group subsection.
      else if (path === "/messaging/compose-group/")
        presenceData.state = "Creating a new group.";
      //Chats subsection.
      else {
        //Getting user preference for showChatUsername.
        const showChatUsername = await presence.getSetting("showChatUsername");

        if (showChatUsername) {
          const charUsername = document
            .querySelector(
              "div.application-outlet > div.authentication-outlet > #messaging > div > div > div:nth-child(2) > div:first-child > div > a > div > div > dl > dt > #thread-detail-jump-target"
            )
            .innerHTML.trim();

          presenceData.state = `Chatting with ${unescapeHTML(charUsername)}.`;
        } else presenceData.state = "Chatting with someone.";
      }
    } else if (path === "/notifications/") {
      //Notifications section.
      presenceData.details = "Viewing Notifications.";
      presenceData.startTimestamp = browsingStamp;
    } else if (path.match(/\/in\/[A-Za-z0-9-]+\/$/)) {
      //Profile page section.
      const userName = document
        .querySelector(
          "div.application-outlet > div.authentication-outlet > #profile-content > div > div > div > div:nth-child(2) > main > div > section > div:nth-child(2) > div:nth-child(2) > div:first-child > ul:first-child > li:first-child"
        )
        .innerHTML.trim();

      presenceData.details = "Viewing a profile:";
      presenceData.state = `${userName}.`;
      presenceData.startTimestamp = browsingStamp;
    } else if (path.match(/\/in\/[A-Za-z0-9-]+\//)) {
      //Profile subsections.
      const userName =
        path !== "/in/luca-biagetti/detail/recent-activity/"
          ? document
              .querySelector(
                "div.application-outlet > div.authentication-outlet > #profile-content > div > div > div > div:nth-child(2) > main > div > section > div:nth-child(2) > div:nth-child(2) > div:first-child > ul:first-child > li:first-child"
              )
              .innerHTML.trim()
          : document
              .querySelector(
                "div.application-outlet > div.authentication-outlet > #profile-content > div > div > div > div > div:first-child > header > h1"
              )
              .innerHTML.trim()
              .replace("’s Activity", "");

      presenceData.startTimestamp = browsingStamp;

      //Profile detail subsection.
      if (path.includes("/detail/")) {
        enum detailSubSection {
          "recent-activity" = "Activities",
          skills = "Skills",
          interests = "Interests",
          "contact-info" = "Contact Info"
        }

        const subsection: string = path
          .split(/\/in\/[A-Za-z0-9-]+\/detail\//)
          .pop()
          .split("/")
          .shift() as keyof typeof detailSubSection;

        //If the user is editing skills (the only edit related subsection with "detail" path).
        if (path === "/in/luca-biagetti/detail/skills/add/") {
          presenceData.details = "Editing profile:";
          presenceData.state = "Skills.";
        } else {
          //Actually detail subsections.
          presenceData.details = "Viewing user details:";
          presenceData.state = `${unescapeHTML(userName)}'s ${
            detailSubSection[subsection as keyof typeof detailSubSection]
          }.`;
        }
      } else if (path.includes("/edit/")) {
        //Profile edit subsection.
        enum editSubSection {
          intro = "Intro.",
          about = "About.",
          "add-feed-post" = "Posts.",
          "add-article" = "Articles.",
          "add-link" = "Links.",
          position = "Experiences.",
          education = "Education.",
          certification = "Certifications.",
          "volunteer-experience" = "Volunteer experiences.",
          publication = "Publications.",
          patent = "Patents.",
          course = "Courses.",
          project = "Projects.",
          honor = "Honors & Awards.",
          "test-score" = "Test scores.",
          language = "Languages.",
          organization = "Organizations.",
          "secondary-language" = "Secondary language.",
          "contact-info" = "Contact info."
        }

        const subsection: string = path
          .split(/\/in\/[A-Za-z0-9-]+\/edit\//)
          .pop()
          .replace("forms/", "")
          .split("/")
          .shift();

        presenceData.details = "Editing profile:";
        presenceData.state =
          editSubSection[subsection as keyof typeof editSubSection];
      }
    } else if (path.match(/\/company\/[A-Za-z0-9-]+\//)) {
      //Company page section.
      const companyName = document
        .querySelector(
          "div.application-outlet > div.authentication-outlet > div > div:nth-child(3) > div:first-child > section > div > div > div:nth-child(2) > div:first-child > div:first-child > div:nth-child(2) > div > h1 > span"
        )
        .innerHTML.trim();

      presenceData.details = "Viewing a company:";
      presenceData.state = `${unescapeHTML(companyName)}.`;
      presenceData.startTimestamp = browsingStamp;
    } else if (path.match(/\/school\/[A-Za-z0-9-]+\//)) {
      //School page section.
      const schoolName = document
        .querySelector(
          "div.application-outlet > div.authentication-outlet > div > div:nth-child(3) > div:first-child > section > div > div > div:nth-child(2) > div:first-child > div:first-child > div:nth-child(2) > div > h1 > span"
        )
        .innerHTML.trim();

      presenceData.details = "Viewing a school:";
      presenceData.state = `${unescapeHTML(schoolName)}.`;
      presenceData.startTimestamp = browsingStamp;
    } else if (path.startsWith("/groups/")) {
      //Groups section.
      //Group page subsection.
      if (path.match(/\/groups\/[0-9]+\//)) {
        const groupName = document
          .querySelector(
            "div.application-outlet > div.authentication-outlet > div > div:nth-child(2) > main > div:first-child > section > div > h1 > span"
          )
          .innerHTML.trim()
          .replace(/<!---->/g, "");

        presenceData.details = "Viewing a group:";
        presenceData.state = `${unescapeHTML(groupName)}.`;
        presenceData.startTimestamp = browsingStamp;
      } else {
        presenceData.details = "Browsing Groups:";
        presenceData.startTimestamp = browsingStamp;

        //Requested groups subsection.
        if (path === "/groups/requests/")
          presenceData.state = "Requested groups.";
        //Homepage.
        else presenceData.state = "My groups.";
      }
    } else if (path.includes("/psettings/")) {
      //Settings section.
      presenceData.details = "Editing settings.";
      presenceData.startTimestamp = browsingStamp;
    } else if (path === "/my-items/") {
      //My Items section.
      presenceData.details = "Browsing My Items.";
      presenceData.startTimestamp = browsingStamp;
    } else if (path === "/post/new/") {
      //New Post section.
      presenceData.details = "Writing a New Post.";
      presenceData.startTimestamp = browsingStamp;
    } else if (path.includes("/search/results/")) {
      //Searching for something section.
      presenceData.details = "Searching for something.";
      presenceData.startTimestamp = browsingStamp;
    } else {
      //Others sections in "Work" category not supported atm.
      presenceData.details = "Doing stuffs.";
      presenceData.startTimestamp = browsingStamp;
    }
  }

  if (!presenceData.details) {
    presence.setTrayTitle();
    presence.setActivity();
  } else presence.setActivity(presenceData);
});
