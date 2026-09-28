import { useNavigate } from 'react-router-dom'

import HeaderBar from '../components/HeaderBar'
import OrderArrows from '../components/OrderArrows'
import Shell from '../components/Shell.module.css'
import { movedIds } from '../lib/reorder'
import { useArmed } from '../lib/useArmed'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Services.module.css'

export default function Services() {
  const { services, loaded, toggleServicePub, removeService, reorderServices } = useStudio()
  const navigate = useNavigate()
  const { armedId, confirm } = useArmed()

  return (
    <>
      <HeaderBar crumb="Catalogue" title="Services" />

      <div className={Shell.content}>
        <div className={css.toolbar}>
          <div className={ui.meta}>{services.length} services · {services.filter((s) => s.isPublished).length} live</div>
          <button type="button" className={`${ui.btnGhost} ${css.add}`} onClick={() => navigate('/services/new')}>
            + Add Service
          </button>
        </div>

        <div className={ui.panel}>
          <div className={css.scroll}>
            <div className={css.table}>
              <div className={css.head}>
                <div className={css.th}>Service</div>
                <div className={css.th}>Address</div>
                <div className={css.th}>Order</div>
                <div className={css.th}>Status</div>
                <div className={css.th}>Actions</div>
              </div>

              {services.map((service, index) => (
                <div key={service.id} className={css.row}>
                  <div>
                    <div className={css.name}>{service.name}</div>
                    <div className={css.sub}>{service.shortDescription}</div>
                  </div>
                  <div className={css.cell}>/services/{service.slug}</div>
                  <OrderArrows index={index} count={services.length} onMove={(from, to) => reorderServices(movedIds(services, from, to))} />
                  <button
                    type="button"
                    className={service.isPublished ? css.live : css.draft}
                    onClick={() => toggleServicePub(service.id)}
                    aria-label={`${service.isPublished ? 'Unpublish' : 'Publish'} ${service.name}`}
                  >
                    {service.isPublished ? 'Live' : 'Draft'}
                  </button>
                  <div className={css.actions}>
                    <button type="button" className={css.edit} onClick={() => navigate(`/services/${service.id}`)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className={armedId === service.id ? `${css.delete} ${ui.armed}` : css.delete}
                      onClick={() => confirm(service.id, () => removeService(service.id))}
                      aria-label={armedId === service.id ? `Confirm delete ${service.name}` : `Delete ${service.name}`}
                      title={armedId === service.id ? 'Click again to delete' : 'Delete'}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {loaded && services.length === 0 && <div className={ui.empty}>No services yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
