import express from 'express'
import { readPushSubscription } from '../../datalayer/pubsub'
import {
  getNewsletterEmail,
  updateConfirmationCode,
} from '../../services/newsletters'
import {
  NewsletterMessage,
  saveNewsletterEmail,
} from '../../services/save_newsletter_email'
import { updateReceivedEmail } from '../../services/received_emails'

interface SetConfirmationCodeMessage {
  emailAddress: string
  confirmationCode: string
}

export function newsletterServiceRouter() {
  const router = express.Router()

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/confirmation', async (req, res) => {
    console.log('setConfirmationCode')

    const { message, expired } = readPushSubscription(req)
    console.log('pubsub message:', message, 'expired:', expired)

    if (!message) {
      res.status(400).send('Bad Request')
      return
    }

    if (expired) {
      console.log('discards expired message:', message)
      res.status(200).send('Expired')
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: SetConfirmationCodeMessage = JSON.parse(message)

      if (!('emailAddress' in data) || !('confirmationCode' in data)) {
        console.log('No email address or confirmation code found in message')
        res.status(400).send('Bad Request')
        return
      }

      const result = await updateConfirmationCode(
        data.emailAddress,
        data.confirmationCode
      )
      if (!result) {
        console.log('Newsletter email not found', data.emailAddress)
        res.status(200).send('Not Found')
        return
      }

      res.status(200).send('confirmation code set')
    } catch (e) {
      console.log(e)
      if (e instanceof SyntaxError) {
        // when message is not a valid json string
        res.status(400).send(e)
      } else {
        res.status(500).send(e)
      }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/create', async (req, res) => {
    console.log('create')

    const { message, expired } = readPushSubscription(req)
    console.log('pubsub message:', message, 'expired:', expired)

    if (!message) {
      res.status(400).send('Bad Request')
      return
    }

    if (expired) {
      console.log('discards expired message:', message)
      res.status(200).send('Expired')
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = JSON.parse(message) as NewsletterMessage
      if (
        !('email' in data) ||
        !('content' in data) ||
        !('title' in data) ||
        !('author' in data)
      ) {
        console.log('invalid newsletter message', data)
        res.status(400).send('Bad Request')
        return
      }

      // get user from newsletter email
      const newsletterEmail = await getNewsletterEmail(data.email)
      if (!newsletterEmail) {
        console.log('newsletter email not found', data.email)
        return false
      }

      const result = await saveNewsletterEmail(data, newsletterEmail)
      if (!result) {
        console.log(
          'Error creating newsletter link from data',
          data.email,
          data.title,
          data.author
        )

        res.status(500).send('Error creating newsletter link')
        return
      }

      // update received email type
      await updateReceivedEmail(data.receivedEmailId, 'article')

      // We always send 200 if it was a valid message
      // because we don't want the
      res.status(200).send('newsletter created')
    } catch (e) {
      console.log(e)
      if (e instanceof SyntaxError) {
        // when message is not a valid json string
        res.status(400).send(e)
      } else {
        res.status(500).send(e)
      }
    }
  })

  return router
}
