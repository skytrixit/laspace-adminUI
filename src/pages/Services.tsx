import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import HeaderBar from '../components/HeaderBar'
import Shell from '../components/Shell.module.css'
import { SERVICE_CATEGORIES, type ServiceCategory } from '../data/types'
import { useStudio } from '../store/studio'
import ui from '../styles/ui.module.css'
import css from './Services.module.css'

type Filter = 'All' | ServiceCategory

const FILTERS: Filter[] = ['All', ...SERVICE_CATEGORIES]

export default function Services() {
  const { services, toggleServicePub, removeService } = useStudio()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('All')

  const rows = services.filter((service) => filter === 'All' || service.cat === filter)

  return (
    <>
      <HeaderBar crumb="Catalogue" title="Services" />

      <div className={Shell.content}>
        <div className={css.toolbar}>
          <div className={ui.pillRow}>
            {FILTERS.map((value) => (
              <button
                key={value}
                type="button"
                className={value === filter ? ui.pillOn : ui.pill}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`${ui.btnGhost} ${css.add}`}
            onClick={() => navigate('/services/new')}
          >
            + Add Service
          </button>
        </div>

        <div className={ui.panel}>
          <div className={css.scroll}>
            <div className={css.table}>
              <div className={css.head}>
                <div className={css.th}>Service</div>
                <div className={css.th}>Category</div>
                <div className={css.th}>Starting Price</div>
                <div className={css.th}>Status</div>
                <div className={css.th}>Actions</div>
              </div>

              {rows.map((service) => (
                <div key={service.id} className={css.row}>
                  <div>
                    <div className={css.name}>{service.n}</div>
                    <div className={css.sub}>{service.sub}</div>
                  </div>
                  <div className={css.cell}>{service.cat}</div>
                  <div className={css.cell}>{service.price}</div>
                  <button
                    type="button"
                    className={service.pub ? css.live : css.draft}
                    onClick={() => toggleServicePub(service.id)}
                    aria-label={`${service.pub ? 'Unpublish' : 'Publish'} ${service.n}`}
                  >
                    {service.pub ? 'Live' : 'Draft'}
                  </button>
                  <div className={css.actions}>
                    <button
                      type="button"
                      className={css.edit}
                      onClick={() => navigate(`/services/${service.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={css.delete}
                      onClick={() => removeService(service.id)}
                      aria-label={`Delete ${service.n}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {rows.length === 0 && <div className={ui.empty}>No services in this category.</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
