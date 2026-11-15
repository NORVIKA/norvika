/**
 * Les actions des documents (porté d'Immuart) :
 *   - après « Publier », un message dit ce qui se passe ensuite (le site se reconstruit tout seul) ;
 *   - les pages et les documents uniques ne se suppriment, ne se dupliquent et ne se dépublient pas
 *     (une page dépubliée disparaîtrait du site et de Google).
 * La suppression d'une réalisation, d'un membre ou d'un avis garde la confirmation native du
 * Studio (« Supprimer le document ? »), qui liste aussi les pages qui s'en servent.
 */
import { useToast } from '@sanity/ui/toast'
import { useEffect, useState } from 'react'
import type { DocumentActionComponent, DocumentActionsResolver } from 'sanity'

import { SANS_CREATION } from './schemas'

export const MESSAGE_PUBLICATION = {
  titre: 'C’est publié',
  texte: 'Le site se reconstruit tout seul : le changement sera en ligne dans quelques minutes.',
}

function avecMessage(original: DocumentActionComponent): DocumentActionComponent {
  const Publier: DocumentActionComponent = (props) => {
    const resultat = original(props)
    const toast = useToast()
    const [enCours, setEnCours] = useState(false)
    // La publication est terminée quand le brouillon disparaît (il devient la version publiée).
    useEffect(() => {
      if (enCours && !props.draft) {
        setEnCours(false)
        toast.push({ status: 'success', title: MESSAGE_PUBLICATION.titre, description: MESSAGE_PUBLICATION.texte, duration: 10000, closable: true })
      }
    }, [enCours, props.draft, toast])
    if (!resultat) return resultat
    return {
      ...resultat,
      onHandle: () => {
        setEnCours(true)
        resultat.onHandle?.()
      },
    }
  }
  Publier.action = original.action
  Publier.displayName = 'PublierAvecMessage'
  return Publier
}

const INTERDITES_SUR_LES_PAGES = ['delete', 'duplicate', 'unpublish']

export const actions: DocumentActionsResolver = (precedentes, contexte) => {
  const avecPublication = precedentes.map((a) => (a.action === 'publish' ? avecMessage(a) : a))
  return SANS_CREATION.includes(contexte.schemaType) ? avecPublication.filter((a) => !INTERDITES_SUR_LES_PAGES.includes(a.action ?? '')) : avecPublication
}
