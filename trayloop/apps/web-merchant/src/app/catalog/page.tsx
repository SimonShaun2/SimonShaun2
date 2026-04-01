'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface Package {
  id: string;
  catalogId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  pricePerHead: number;
  currency: string;
  pricing: string;
  minHeadCount: number | null;
  maxHeadCount: number | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface AddOn {
  id: string;
  catalogId: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  sortOrder: number;
  isActive: boolean;
}

interface Category {
  id: string;
  catalogId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  packages: Package[];
}

interface Catalog {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  categories: Category[];
  uncategorizedPackages: Package[];
  addOns: AddOn[];
}

interface CatalogFormState {
  id?: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface CategoryFormState {
  id?: string;
  catalogId: string;
  name: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
}

interface PackageFormState {
  id?: string;
  catalogId: string;
  categoryId: string;
  name: string;
  description: string;
  pricePerHead: string;
  minimumHeadcount: string;
  maximumHeadcount: string;
  imageUrl: string;
  isActive: boolean;
}

interface AddOnFormState {
  id?: string;
  catalogId: string;
  name: string;
  description: string;
  price: string;
  sortOrder: string;
  isActive: boolean;
}

type EditorState =
  | { kind: 'catalog'; mode: 'create' | 'edit' }
  | { kind: 'category'; mode: 'create' | 'edit' }
  | { kind: 'package'; mode: 'create' | 'edit' }
  | { kind: 'addon'; mode: 'create' | 'edit' }
  | null;

const EMPTY_CATALOG_FORM: CatalogFormState = {
  name: '',
  description: '',
  isActive: true,
};

const EMPTY_CATEGORY_FORM: CategoryFormState = {
  catalogId: '',
  name: '',
  description: '',
  sortOrder: '0',
  isActive: true,
};

const EMPTY_PACKAGE_FORM: PackageFormState = {
  catalogId: '',
  categoryId: '',
  name: '',
  description: '',
  pricePerHead: '',
  minimumHeadcount: '10',
  maximumHeadcount: '',
  imageUrl: '',
  isActive: true,
};

const EMPTY_ADDON_FORM: AddOnFormState = {
  catalogId: '',
  name: '',
  description: '',
  price: '',
  sortOrder: '0',
  isActive: true,
};

export default function CatalogPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<EditorState>(null);
  const [catalogForm, setCatalogForm] = useState<CatalogFormState>(EMPTY_CATALOG_FORM);
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(EMPTY_CATEGORY_FORM);
  const [packageForm, setPackageForm] = useState<PackageFormState>(EMPTY_PACKAGE_FORM);
  const [addOnForm, setAddOnForm] = useState<AddOnFormState>(EMPTY_ADDON_FORM);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    void fetchMenu();
  }, []);

  const totalPackages = catalogs.reduce(
    (sum, catalog) =>
      sum +
      catalog.categories.reduce((categorySum, category) => categorySum + category.packages.length, 0) +
      catalog.uncategorizedPackages.length,
    0,
  );
  const totalAddOns = catalogs.reduce((sum, catalog) => sum + catalog.addOns.length, 0);

  const categoryOptions = useMemo(
    () =>
      catalogs.flatMap((catalog) =>
        catalog.categories.map((category) => ({
          id: category.id,
          label: `${catalog.name} / ${category.name}`,
          catalogId: catalog.id,
        })),
      ),
    [catalogs],
  );

  async function fetchMenu() {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/catalogs/menu');
      setCatalogs(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }

  function openNewCatalog() {
    setEditor({ kind: 'catalog', mode: 'create' });
    setCatalogForm(EMPTY_CATALOG_FORM);
    setNotice('');
    setError('');
  }

  function openEditCatalog(catalog: Catalog) {
    setEditor({ kind: 'catalog', mode: 'edit' });
    setCatalogForm({
      id: catalog.id,
      name: catalog.name,
      description: catalog.description ?? '',
      isActive: catalog.isActive,
    });
    setNotice('');
    setError('');
  }

  function openNewCategory(catalogId: string) {
    setEditor({ kind: 'category', mode: 'create' });
    setCategoryForm({
      ...EMPTY_CATEGORY_FORM,
      catalogId,
    });
    setNotice('');
    setError('');
  }

  function openEditCategory(category: Category) {
    setEditor({ kind: 'category', mode: 'edit' });
    setCategoryForm({
      id: category.id,
      catalogId: category.catalogId,
      name: category.name,
      description: category.description ?? '',
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    });
    setNotice('');
    setError('');
  }

  function openNewPackage(catalogId: string, categoryId?: string | null) {
    setEditor({ kind: 'package', mode: 'create' });
    setPackageForm({
      ...EMPTY_PACKAGE_FORM,
      catalogId,
      categoryId: categoryId ?? '',
    });
    setNotice('');
    setError('');
  }

  function openEditPackage(pkg: Package) {
    setEditor({ kind: 'package', mode: 'edit' });
    setPackageForm({
      id: pkg.id,
      catalogId: pkg.catalogId,
      categoryId: pkg.categoryId ?? '',
      name: pkg.name,
      description: pkg.description ?? '',
      pricePerHead: centsToDollars(pkg.pricePerHead),
      minimumHeadcount: pkg.minHeadCount ? String(pkg.minHeadCount) : '',
      maximumHeadcount: pkg.maxHeadCount ? String(pkg.maxHeadCount) : '',
      imageUrl: pkg.imageUrl ?? '',
      isActive: pkg.isActive,
    });
    setNotice('');
    setError('');
  }

  function openNewAddOn(catalogId: string) {
    setEditor({ kind: 'addon', mode: 'create' });
    setAddOnForm({
      ...EMPTY_ADDON_FORM,
      catalogId,
    });
    setNotice('');
    setError('');
  }

  function openEditAddOn(addOn: AddOn) {
    setEditor({ kind: 'addon', mode: 'edit' });
    setAddOnForm({
      id: addOn.id,
      catalogId: addOn.catalogId,
      name: addOn.name,
      description: addOn.description ?? '',
      price: centsToDollars(addOn.price),
      sortOrder: String(addOn.sortOrder),
      isActive: addOn.isActive,
    });
    setNotice('');
    setError('');
  }

  async function handleCatalogSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: requiredValue(catalogForm.name, 'Catalog name'),
        description: optionalValue(catalogForm.description),
        ...(editor?.mode === 'edit' ? { isActive: catalogForm.isActive } : {}),
      };

      if (editor?.mode === 'edit' && catalogForm.id) {
        await apiFetch(`/api/catalogs/${catalogForm.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setNotice('Catalog updated.');
      } else {
        await apiFetch('/api/catalogs', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setNotice('Catalog created.');
      }

      await fetchMenu();
      setEditor(null);
      setCatalogForm(EMPTY_CATALOG_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save catalog');
    } finally {
      setSaving(false);
    }
  }

  async function handleCategorySubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const basePayload = {
        name: requiredValue(categoryForm.name, 'Category name'),
        description: optionalValue(categoryForm.description),
        sortOrder: parseNumberField(categoryForm.sortOrder, 'Sort order', false),
      };

      if (editor?.mode === 'edit' && categoryForm.id) {
        await apiFetch(`/api/catalogs/categories/${categoryForm.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            ...basePayload,
            isActive: categoryForm.isActive,
          }),
        });
        setNotice('Category updated.');
      } else {
        await apiFetch('/api/catalogs/categories', {
          method: 'POST',
          body: JSON.stringify({
            ...basePayload,
            catalogId: requiredValue(categoryForm.catalogId, 'Catalog'),
          }),
        });
        setNotice('Category created.');
      }

      await fetchMenu();
      setEditor(null);
      setCategoryForm(EMPTY_CATEGORY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSaving(false);
    }
  }

  async function handlePackageSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        catalogId: requiredValue(packageForm.catalogId, 'Catalog'),
        categoryId: optionalValue(packageForm.categoryId),
        name: requiredValue(packageForm.name, 'Package name'),
        description: optionalValue(packageForm.description),
        pricePerHead: dollarsToCents(packageForm.pricePerHead, 'Package price'),
        minimumHeadcount: parseNumberField(packageForm.minimumHeadcount, 'Minimum headcount'),
        maximumHeadcount: packageForm.maximumHeadcount
          ? parseNumberField(packageForm.maximumHeadcount, 'Maximum headcount')
          : undefined,
        imageUrl: optionalValue(packageForm.imageUrl),
        isActive: packageForm.isActive,
      };

      if (editor?.mode === 'edit' && packageForm.id) {
        await apiFetch(`/api/packages/${packageForm.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setNotice('Package updated.');
      } else {
        await apiFetch('/api/packages', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setNotice('Package created.');
      }

      await fetchMenu();
      setEditor(null);
      setPackageForm(EMPTY_PACKAGE_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save package');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddOnSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        catalogId: requiredValue(addOnForm.catalogId, 'Catalog'),
        name: requiredValue(addOnForm.name, 'Add-on name'),
        description: optionalValue(addOnForm.description),
        price: dollarsToCents(addOnForm.price, 'Add-on price'),
        sortOrder: parseNumberField(addOnForm.sortOrder, 'Sort order', false),
        isActive: addOnForm.isActive,
      };

      if (editor?.mode === 'edit' && addOnForm.id) {
        await apiFetch(`/api/add-ons/${addOnForm.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setNotice('Add-on updated.');
      } else {
        await apiFetch('/api/add-ons', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setNotice('Add-on created.');
      }

      await fetchMenu();
      setEditor(null);
      setAddOnForm(EMPTY_ADDON_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save add-on');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Loading offerings...</p>;

  return (
    <div>
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Your Offerings</h1>
          <p style={{ margin: '6px 0 0', color: '#78716C', fontSize: 14 }}>
            Build and edit the catalogs, packages, and add-ons your customers can order.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={openNewCatalog} style={secondaryButtonStyle}>
            New Catalog
          </button>
          <button
            type="button"
            onClick={() => openNewPackage(catalogs[0]?.id ?? '')}
            style={secondaryButtonStyle}
            disabled={catalogs.length === 0}
          >
            New Package
          </button>
          <button
            type="button"
            onClick={() => openNewAddOn(catalogs[0]?.id ?? '')}
            style={primaryButtonStyle}
            disabled={catalogs.length === 0}
          >
            New Add-On
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#6b7280', marginBottom: 18, flexWrap: 'wrap' }}>
        <span>{catalogs.length} catalog{catalogs.length !== 1 ? 's' : ''}</span>
        <span>{totalPackages} package{totalPackages !== 1 ? 's' : ''}</span>
        <span>{totalAddOns} add-on{totalAddOns !== 1 ? 's' : ''}</span>
      </div>

      {notice ? <Banner tone="success" text={notice} /> : null}
      {error ? <Banner tone="error" text={error} /> : null}

      {catalogs.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#1C1917' }}>No offerings yet</p>
          <p style={{ fontSize: 14, color: '#78716C', margin: '8px 0 18px' }}>
            Start by creating a catalog, then add packages and add-ons your storefront can sell.
          </p>
          <button type="button" onClick={openNewCatalog} style={primaryButtonStyle}>
            Create Your First Catalog
          </button>
        </div>
      ) : (
        <div style={layoutStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {catalogs.map((catalog) => (
              <div key={catalog.id} style={catalogCardStyle}>
                <div style={catalogHeaderStyle}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{catalog.name}</h2>
                      <StatusBadge active={catalog.isActive} activeLabel="Active" inactiveLabel="Inactive" />
                    </div>
                    {catalog.description ? (
                      <p style={{ fontSize: 13, color: '#6b7280', margin: '6px 0 0' }}>{catalog.description}</p>
                    ) : null}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => openEditCatalog(catalog)} style={ghostButtonStyle}>
                      Edit Catalog
                    </button>
                    <button type="button" onClick={() => openNewCategory(catalog.id)} style={ghostButtonStyle}>
                      New Category
                    </button>
                    <button type="button" onClick={() => openNewPackage(catalog.id)} style={ghostButtonStyle}>
                      New Package
                    </button>
                    <button type="button" onClick={() => openNewAddOn(catalog.id)} style={ghostButtonStyle}>
                      New Add-On
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {catalog.categories.map((category) => (
                    <div key={category.id} style={sectionBlockStyle}>
                      <div style={sectionHeaderStyle}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{category.name}</h3>
                            <StatusBadge active={category.isActive} activeLabel="Active" inactiveLabel="Inactive" />
                          </div>
                          {category.description ? (
                            <p style={{ fontSize: 12, color: '#78716C', margin: '4px 0 0' }}>{category.description}</p>
                          ) : null}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => openEditCategory(category)} style={ghostButtonStyle}>
                            Edit Category
                          </button>
                          <button type="button" onClick={() => openNewPackage(catalog.id, category.id)} style={ghostButtonStyle}>
                            Add Package
                          </button>
                        </div>
                      </div>

                      {category.packages.length === 0 ? (
                        <p style={hintStyle}>No packages in this category yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {category.packages.map((pkg) => (
                            <PackageRow key={pkg.id} pkg={pkg} onEdit={() => openEditPackage(pkg)} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div style={sectionBlockStyle}>
                    <div style={sectionHeaderStyle}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Uncategorized Packages</h3>
                      <button type="button" onClick={() => openNewPackage(catalog.id)} style={ghostButtonStyle}>
                        Add Package
                      </button>
                    </div>
                    {catalog.uncategorizedPackages.length === 0 ? (
                      <p style={hintStyle}>No uncategorized packages.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {catalog.uncategorizedPackages.map((pkg) => (
                          <PackageRow key={pkg.id} pkg={pkg} onEdit={() => openEditPackage(pkg)} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={sectionBlockStyle}>
                    <div style={sectionHeaderStyle}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Add-Ons</h3>
                      <button type="button" onClick={() => openNewAddOn(catalog.id)} style={ghostButtonStyle}>
                        Add Add-On
                      </button>
                    </div>
                    {catalog.addOns.length === 0 ? (
                      <p style={hintStyle}>No add-ons yet.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                        {catalog.addOns.map((addOn) => (
                          <AddOnCard key={addOn.id} addOn={addOn} onEdit={() => openEditAddOn(addOn)} />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside style={editorPanelStyle}>
            {editor ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                      {editor.mode === 'create' ? 'Create' : 'Edit'}
                    </div>
                    <h2 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700 }}>
                      {editor.kind === 'catalog'
                        ? editor.mode === 'create'
                          ? 'New Catalog'
                          : 'Catalog Details'
                        : editor.kind === 'category'
                          ? editor.mode === 'create'
                            ? 'New Category'
                            : 'Category Details'
                          : editor.kind === 'package'
                            ? editor.mode === 'create'
                              ? 'New Package'
                              : 'Package Details'
                            : editor.mode === 'create'
                              ? 'New Add-On'
                              : 'Add-On Details'}
                    </h2>
                  </div>
                  <button type="button" onClick={() => setEditor(null)} style={closeButtonStyle}>
                    Close
                  </button>
                </div>

                {editor.kind === 'catalog' ? (
                  <form onSubmit={handleCatalogSubmit} style={formStyle}>
                    <Field label="Catalog Name">
                      <input
                        value={catalogForm.name}
                        onChange={(event) => setCatalogForm((current) => ({ ...current, name: event.target.value }))}
                        style={inputStyle}
                        placeholder="Corporate Catering"
                        required
                      />
                    </Field>
                    <Field label="Description">
                      <textarea
                        value={catalogForm.description}
                        onChange={(event) => setCatalogForm((current) => ({ ...current, description: event.target.value }))}
                        style={textareaStyle}
                        rows={4}
                        placeholder="Menus for daily office meals, executive lunches, and events."
                      />
                    </Field>
                    {editor.mode === 'edit' ? (
                      <ToggleRow
                        title="Catalog active"
                        checked={catalogForm.isActive}
                        onChange={(checked) => setCatalogForm((current) => ({ ...current, isActive: checked }))}
                      />
                    ) : null}
                    <button type="submit" disabled={saving} style={primaryButtonStyle}>
                      {saving ? 'Saving...' : editor.mode === 'create' ? 'Create Catalog' : 'Save Catalog'}
                    </button>
                  </form>
                ) : null}

                {editor.kind === 'category' ? (
                  <form onSubmit={handleCategorySubmit} style={formStyle}>
                    <Field label="Catalog">
                      <select
                        value={categoryForm.catalogId}
                        onChange={(event) => setCategoryForm((current) => ({ ...current, catalogId: event.target.value }))}
                        style={inputStyle}
                        disabled={editor.mode === 'edit'}
                      >
                        <option value="">Select a catalog</option>
                        {catalogs.map((catalog) => (
                          <option key={catalog.id} value={catalog.id}>
                            {catalog.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Category Name">
                      <input
                        value={categoryForm.name}
                        onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                        style={inputStyle}
                        placeholder="Boxed Lunches"
                        required
                      />
                    </Field>
                    <Field label="Description">
                      <textarea
                        value={categoryForm.description}
                        onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))}
                        style={textareaStyle}
                        rows={3}
                        placeholder="A quick way for customers to browse this category."
                      />
                    </Field>
                    <Field label="Sort Order">
                      <input
                        value={categoryForm.sortOrder}
                        onChange={(event) => setCategoryForm((current) => ({ ...current, sortOrder: event.target.value }))}
                        style={inputStyle}
                        inputMode="numeric"
                      />
                    </Field>
                    {editor.mode === 'edit' ? (
                      <ToggleRow
                        title="Category active"
                        checked={categoryForm.isActive}
                        onChange={(checked) => setCategoryForm((current) => ({ ...current, isActive: checked }))}
                      />
                    ) : null}
                    <button type="submit" disabled={saving} style={primaryButtonStyle}>
                      {saving ? 'Saving...' : editor.mode === 'create' ? 'Create Category' : 'Save Category'}
                    </button>
                  </form>
                ) : null}

                {editor.kind === 'package' ? (
                  <form onSubmit={handlePackageSubmit} style={formStyle}>
                    <Field label="Catalog">
                      <select
                        value={packageForm.catalogId}
                        onChange={(event) =>
                          setPackageForm((current) => ({
                            ...current,
                            catalogId: event.target.value,
                            categoryId:
                              categoryOptions.find((option) => option.catalogId === event.target.value && option.id === current.categoryId)?.id ??
                              '',
                          }))
                        }
                        style={inputStyle}
                      >
                        <option value="">Select a catalog</option>
                        {catalogs.map((catalog) => (
                          <option key={catalog.id} value={catalog.id}>
                            {catalog.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Category">
                      <select
                        value={packageForm.categoryId}
                        onChange={(event) => setPackageForm((current) => ({ ...current, categoryId: event.target.value }))}
                        style={inputStyle}
                      >
                        <option value="">Uncategorized</option>
                        {categoryOptions
                          .filter((option) => option.catalogId === packageForm.catalogId)
                          .map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                      </select>
                    </Field>
                    <Field label="Package Name">
                      <input
                        value={packageForm.name}
                        onChange={(event) => setPackageForm((current) => ({ ...current, name: event.target.value }))}
                        style={inputStyle}
                        placeholder="Executive Lunch Buffet"
                        required
                      />
                    </Field>
                    <Field label="Price Per Person ($)">
                      <input
                        value={packageForm.pricePerHead}
                        onChange={(event) => setPackageForm((current) => ({ ...current, pricePerHead: event.target.value }))}
                        style={inputStyle}
                        inputMode="decimal"
                        placeholder="24.95"
                        required
                      />
                    </Field>
                    <Field label="Minimum Headcount">
                      <input
                        value={packageForm.minimumHeadcount}
                        onChange={(event) => setPackageForm((current) => ({ ...current, minimumHeadcount: event.target.value }))}
                        style={inputStyle}
                        inputMode="numeric"
                        required
                      />
                    </Field>
                    <Field label="Maximum Headcount">
                      <input
                        value={packageForm.maximumHeadcount}
                        onChange={(event) => setPackageForm((current) => ({ ...current, maximumHeadcount: event.target.value }))}
                        style={inputStyle}
                        inputMode="numeric"
                        placeholder="Optional"
                      />
                    </Field>
                    <Field label="Image URL">
                      <input
                        value={packageForm.imageUrl}
                        onChange={(event) => setPackageForm((current) => ({ ...current, imageUrl: event.target.value }))}
                        style={inputStyle}
                        placeholder="https://..."
                      />
                    </Field>
                    <Field label="Description">
                      <textarea
                        value={packageForm.description}
                        onChange={(event) => setPackageForm((current) => ({ ...current, description: event.target.value }))}
                        style={textareaStyle}
                        rows={4}
                        placeholder="Describe what is included, how it is served, and what makes it stand out."
                      />
                    </Field>
                    <ToggleRow
                      title="Package active"
                      checked={packageForm.isActive}
                      onChange={(checked) => setPackageForm((current) => ({ ...current, isActive: checked }))}
                    />
                    <button type="submit" disabled={saving} style={primaryButtonStyle}>
                      {saving ? 'Saving...' : editor.mode === 'create' ? 'Create Package' : 'Save Package'}
                    </button>
                  </form>
                ) : null}

                {editor.kind === 'addon' ? (
                  <form onSubmit={handleAddOnSubmit} style={formStyle}>
                    <Field label="Catalog">
                      <select
                        value={addOnForm.catalogId}
                        onChange={(event) => setAddOnForm((current) => ({ ...current, catalogId: event.target.value }))}
                        style={inputStyle}
                      >
                        <option value="">Select a catalog</option>
                        {catalogs.map((catalog) => (
                          <option key={catalog.id} value={catalog.id}>
                            {catalog.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Add-On Name">
                      <input
                        value={addOnForm.name}
                        onChange={(event) => setAddOnForm((current) => ({ ...current, name: event.target.value }))}
                        style={inputStyle}
                        placeholder="Dessert Tray"
                        required
                      />
                    </Field>
                    <Field label="Price ($)">
                      <input
                        value={addOnForm.price}
                        onChange={(event) => setAddOnForm((current) => ({ ...current, price: event.target.value }))}
                        style={inputStyle}
                        inputMode="decimal"
                        placeholder="45.00"
                        required
                      />
                    </Field>
                    <Field label="Sort Order">
                      <input
                        value={addOnForm.sortOrder}
                        onChange={(event) => setAddOnForm((current) => ({ ...current, sortOrder: event.target.value }))}
                        style={inputStyle}
                        inputMode="numeric"
                      />
                    </Field>
                    <Field label="Description">
                      <textarea
                        value={addOnForm.description}
                        onChange={(event) => setAddOnForm((current) => ({ ...current, description: event.target.value }))}
                        style={textareaStyle}
                        rows={3}
                        placeholder="Optional upsell details for merchants and customers."
                      />
                    </Field>
                    <ToggleRow
                      title="Add-on active"
                      checked={addOnForm.isActive}
                      onChange={(checked) => setAddOnForm((current) => ({ ...current, isActive: checked }))}
                    />
                    <button type="submit" disabled={saving} style={primaryButtonStyle}>
                      {saving ? 'Saving...' : editor.mode === 'create' ? 'Create Add-On' : 'Save Add-On'}
                    </button>
                  </form>
                ) : null}
              </>
            ) : (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0 }}>Offerings Editor</h2>
                <p style={{ fontSize: 14, color: '#78716C', lineHeight: 1.6 }}>
                  Choose a catalog, category, package, or add-on to edit from the left, or create a new one from the action buttons above.
                </p>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function Banner({ tone, text }: { tone: 'success' | 'error'; text: string }) {
  return (
    <div
      style={{
        marginBottom: 16,
        padding: '12px 14px',
        borderRadius: 10,
        border: `1px solid ${tone === 'success' ? '#BBF7D0' : '#FECACA'}`,
        background: tone === 'success' ? '#F0FDF4' : '#FEF2F2',
        color: tone === 'success' ? '#166534' : '#B91C1C',
        fontSize: 14,
      }}
    >
      {text}
    </div>
  );
}

function PackageRow({ pkg, onEdit }: { pkg: Package; onEdit: () => void }) {
  return (
    <div style={rowStyle}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{pkg.name}</span>
          <StatusBadge active={pkg.isActive} activeLabel="Active" inactiveLabel="Inactive" />
        </div>
        {pkg.description ? <p style={{ fontSize: 12, color: '#78716C', margin: '4px 0' }}>{pkg.description}</p> : null}
        <div style={{ fontSize: 12, color: '#A8A29E' }}>
          {pkg.minHeadCount ? `Min ${pkg.minHeadCount}` : 'No minimum'}
          {pkg.maxHeadCount ? ` / Max ${pkg.maxHeadCount}` : ''}
          {' guests'}
        </div>
      </div>
      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#D4A853' }}>${(pkg.pricePerHead / 100).toFixed(2)}</div>
          <div style={{ fontSize: 11, color: '#9CA3AF' }}>/person</div>
        </div>
        <button type="button" onClick={onEdit} style={ghostButtonStyle}>
          Edit
        </button>
      </div>
    </div>
  );
}

function AddOnCard({ addOn, onEdit }: { addOn: AddOn; onEdit: () => void }) {
  return (
    <div style={addOnCardStyle}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{addOn.name}</span>
          <StatusBadge active={addOn.isActive} activeLabel="Active" inactiveLabel="Inactive" />
        </div>
        {addOn.description ? <p style={{ fontSize: 12, color: '#78716C', margin: '6px 0 0' }}>{addOn.description}</p> : null}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 12 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#D4A853' }}>${(addOn.price / 100).toFixed(2)}</span>
        <button type="button" onClick={onEdit} style={ghostButtonStyle}>
          Edit
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

function ToggleRow({
  title,
  checked,
  onChange,
}: {
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label style={toggleStyle}>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{title}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: 999,
        background: active ? '#DCFCE7' : '#F3F4F6',
        color: active ? '#166534' : '#6B7280',
      }}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function requiredValue(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required`);
  }
  return trimmed;
}

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseNumberField(value: string, label: string, positive = true) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || (positive ? parsed <= 0 : parsed < 0)) {
    throw new Error(`${label} must be a valid number`);
  }
  return parsed;
}

function dollarsToCents(value: string, label: string) {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`${label} must be a valid amount`);
  }
  return Math.round(parsed * 100);
}

function centsToDollars(value: number) {
  return (value / 100).toFixed(2);
}

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  marginBottom: 10,
  flexWrap: 'wrap',
};

const layoutStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.65fr) minmax(320px, 0.95fr)',
  gap: 20,
  alignItems: 'start',
};

const catalogCardStyle: React.CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 16,
  background: '#FFFFFF',
  padding: 18,
};

const catalogHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 16,
};

const sectionBlockStyle: React.CSSProperties = {
  border: '1px solid #F1F5F9',
  borderRadius: 12,
  padding: 14,
  background: '#FAFAF9',
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  marginBottom: 10,
  flexWrap: 'wrap',
};

const editorPanelStyle: React.CSSProperties = {
  position: 'sticky',
  top: 24,
  border: '1px solid #E7E5E4',
  borderRadius: 16,
  background: '#FFFFFF',
  padding: 20,
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 10,
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  padding: '10px 12px',
  fontSize: 14,
  color: '#1C1917',
  boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 110,
  resize: 'vertical',
};

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#78716C',
  marginBottom: 6,
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  padding: '10px 12px',
  border: '1px solid #E7E5E4',
  borderRadius: 10,
  background: '#FFFFFF',
};

const addOnCardStyle: React.CSSProperties = {
  border: '1px solid #E7E5E4',
  borderRadius: 12,
  background: '#FFFFFF',
  padding: 14,
};

const hintStyle: React.CSSProperties = {
  fontSize: 13,
  color: '#78716C',
  margin: 0,
};

const emptyStateStyle: React.CSSProperties = {
  border: '1px dashed #D6D3D1',
  borderRadius: 16,
  background: '#FAFAF9',
  padding: '36px 28px',
  textAlign: 'center',
  maxWidth: 560,
};

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  border: 'none',
  borderRadius: 10,
  background: '#1C1917',
  color: '#FFFFFF',
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #D6D3D1',
  borderRadius: 10,
  background: '#FFFFFF',
  color: '#44403C',
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
};

const ghostButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #E7E5E4',
  borderRadius: 10,
  background: '#FFFFFF',
  color: '#57534E',
  padding: '8px 12px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const closeButtonStyle: React.CSSProperties = {
  ...ghostButtonStyle,
  padding: '8px 10px',
};

const toggleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  border: '1px solid #E7E5E4',
  borderRadius: 10,
  padding: '11px 12px',
  background: '#FAFAF9',
};
