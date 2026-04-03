<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Menu Categories</h2>
        <p class="text-slate-500 text-sm">Organize your shop catalog into groups.</p>
      </div>

      <Dialog v-model:open="isModalOpen">
        <DialogTrigger as-child>
          <Button @click="openModal()" class="rounded-full shadow-sm" :disabled="!currentShopId">
            <LucidePlus class="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{{ form.id ? 'Edit Category' : 'New Category' }}</DialogTitle>
            <DialogDescription>Group your menu items.</DialogDescription>
          </DialogHeader>

          <form @submit.prevent="saveCategory" class="space-y-4 pt-4">
            <div class="space-y-2">
              <Label for="cat_name">Category Name</Label>
              <Input id="cat_name" v-model="form.name" placeholder="E.g. Main Courses, Drinks, Desserts" required />
            </div>

            <div class="space-y-2">
               <Label for="cat_order">Display Priority (Higher = First)</Label>
               <Input id="cat_order" v-model.number="form.order_index" type="number" required />
            </div>

            <DialogFooter class="pt-4">
              <Button type="button" variant="ghost" @click="isModalOpen = false">Cancel</Button>
              <Button type="submit" :disabled="isSaving">
                <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
                {{ form.id ? 'Save Changes' : 'Create Category' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <Card class="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader>
        <CardTitle class="text-[10px] font-black uppercase tracking-widest text-slate-400">Inventory Classification</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="category in categories" :key="category.id">
            <TableCell class="font-medium">{{ category.name }}</TableCell>
            <TableCell>
              <Badge variant="secondary">{{ category.order_index }}</Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button variant="ghost" size="sm" @click="openModal(category)">
                  <LucidePencil class="h-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10" @click="deleteCategory(category.id)">
                  <LucideTrash2 class="h-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-if="!pending && (categories?.length || 0) === 0">
            <TableCell colspan="3" class="h-24 text-center text-muted-foreground">
              {{ !currentShopId ? 'Please select a shop location' : 'No categories found.' }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus as LucidePlus, Loader2 as LucideLoader2, 
  Pencil as LucidePencil, Trash2 as LucideTrash2 
} from 'lucide-vue-next';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from '~/components/ui/dialog';

definePageMeta({ layout: 'admin' });

interface Category { id: string; name: string; order_index: number; }

const currentShopId = useState<string | null>('currentShopId');
const token = useCookie('token');

const { data: categories, refresh: refreshCategories, pending } = await useFetch<Category[]>(() => 
  currentShopId.value ? `/api/admin/categories?shopId=${currentShopId.value}` : '/api/admin/categories?shopId=none', 
  { headers: { Authorization: `Bearer ${token.value}` } }
);

const isModalOpen = ref(false);
const isSaving = ref(false);
const form = reactive({
  id: null as string | null,
  name: '',
  order_index: 0
});

const openModal = (category: any = null) => {
  if (category) {
    Object.assign(form, category);
  } else {
    Object.assign(form, { id: null, name: '', order_index: 0 });
  }
  isModalOpen.value = true;
};

const saveCategory = async () => {
  if (!currentShopId.value) return;
  isSaving.value = true;
  try {
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/admin/categories/${form.id}` : '/api/admin/categories';
    
    await $fetch(url, {
      method,
      body: { ...form, shop_id: currentShopId.value },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    isModalOpen.value = false;
    refreshCategories();
  } catch (e) {
    console.error('Save error:', e);
  } finally {
    isSaving.value = false;
  }
};

const deleteCategory = async (id: string) => {
  if (!confirm('Are you sure you want to delete this category? Menu items in this group will need reassignment.')) return;
  try {
    await $fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    refreshCategories();
  } catch (e) {
    console.error('Delete error:', e);
  }
};

// Refresh when current shop changes
watch(currentShopId, () => refreshCategories());
</script>
