import winston, { createLogger } from "winston";
import {
  DocumentType,
  FeedbackDocument,
  LogDocument,
  VisitDocument,
  VisitCommonInfo,
  VisitNonPIIInfo,
  VisitPIIInfo
} from "audere-lib";
import { AccessKey } from "../models/accessKey";
import { VisitNonPII, VisitPII } from "../models/visit";
import { Feedback } from "../models/feedback";
import { sendEmail } from "../util/email";
import logger from "../util/logger";

const clientLogger = createLogger({
  transports: [
    new winston.transports.File({ filename: "clients.log", level: "debug" })
  ]
});

const FEEDBACK_EMAIL = "feedback@auderenow.org";
const FEEDBACK_SENDER_EMAIL = "app@auderenow.org";

const IDENTITY_RESPONSE_KEYS = new Set([
  "Address",
  "AddressCampus",
  "BedAssignment",
  "BirthDate",
  "CampusBuilding",
  "SchoolName",
  "WorkAddress"
]);

export async function putDocument(req, res) {
  switch (req.body.documentType) {
    case DocumentType.Visit:
      const csruid = req.params.documentId;
      const visitDocument = req.body as VisitDocument;
      const responses = visitDocument.visit.responses;
      const visitCommon: VisitCommonInfo = {
        complete: visitDocument.visit.complete,
        location: visitDocument.visit.location,
        administrator: visitDocument.visit.administrator,
        events: visitDocument.visit.events
      };
      const visitNonPII: VisitNonPIIInfo = {
        ...visitCommon,
        giftcards: visitDocument.visit.giftcards,
        samples: visitDocument.visit.samples,
        responses: (responses || []).filter(
          x => !IDENTITY_RESPONSE_KEYS.has(x.id)
        )
      };
      const visitPII: VisitPIIInfo = {
        ...visitCommon,
        gps_location: visitDocument.visit.gps_location,
        patient: visitDocument.visit.patient,
        consents: visitDocument.visit.consents,
        responses: (responses || []).filter(x =>
          IDENTITY_RESPONSE_KEYS.has(x.id)
        )
      };
      await Promise.all([
        VisitNonPII.upsert({
          csruid,
          device: visitDocument.device,
          visit: visitNonPII
        }),
        VisitPII.upsert({
          csruid,
          device: visitDocument.device,
          visit: visitPII
        })
      ]);
      break;
    case DocumentType.Feedback:
      const feedbackDocument = req.body as FeedbackDocument;
      await sendEmail({
        subject: `[In-App Feedback] ${feedbackDocument.feedback.subject}`,
        body:
          feedbackDocument.feedback.body +
          "\n\n" +
          JSON.stringify(feedbackDocument.device, null, 2),
        to: [FEEDBACK_EMAIL],
        from: FEEDBACK_SENDER_EMAIL,
        replyTo: FEEDBACK_EMAIL
      });
      await Feedback.create({
        subject: feedbackDocument.feedback.subject,
        body: feedbackDocument.feedback.body,
        device: feedbackDocument.device
      });
      break;
    case DocumentType.Log:
      const log = req.body as LogDocument;
      clientLogger.info(JSON.stringify(log));
      break;
    default:
      throw new Error("Invalid document type");
  }
  res.json({ Status: "SUCCESS" });
}

export async function putDocumentWithKey(req, res, next) {
  const matchingKey = await AccessKey.findOne({
    where: { key: req.params.key, valid: true }
  });

  if (!matchingKey) {
    next();
    logger.warn(`Rejected document upload with key: ${req.params.key}`);
    return;
  }
  try {
    return await putDocument(req, res);
  } catch (e) {
    next(e);
  }
}
