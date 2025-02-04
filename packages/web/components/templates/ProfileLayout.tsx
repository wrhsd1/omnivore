import { Box, VStack, HStack } from '../elements/LayoutPrimitives'
import { OmnivoreNameLogo } from '../elements/images/OmnivoreNameLogo'
import { theme } from '../tokens/stitches.config'

type ProfileLayoutProps = {
  logoDestination?: string
  children: React.ReactNode
}

export function ProfileLayout(props: ProfileLayoutProps): JSX.Element {
  return (
    <>
      <VStack
        alignment="center"
        distribution="center"
        css={{
          // bg: '$omnivoreYellow',
          height: '100vh',
          background:
            '-webkit-linear-gradient(-65deg, rgba(255, 255, 255, 1.0) 45%, rgba(255, 210, 52, 1.0) 0%)',
        }}
      >
        {props.children}
      </VStack>

      <Box
        css={{
          position: 'absolute',
          top: 0,
          left: 0,
          m: '0',
          width: '100%',
        }}
      >
        <HStack
          alignment="center"
          distribution="between"
          css={{
            mt: '18px',
            ml: '18px',
            mr: '0',
            '@smDown': {
              ml: '8px',
              mt: '10px',
            },
          }}
        >
          <OmnivoreNameLogo
            color={theme.colors.omnivoreGray.toString()}
            href={props.logoDestination ?? '/login'}
          />
        </HStack>
      </Box>
    </>
  )
}
