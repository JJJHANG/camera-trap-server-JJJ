var $csrf_token = $('[name="csrfmiddlewaretoken"]').attr('value');

      $(document).ready(function() {


        let pk = $('input[name=pk]').val();

      $.ajax({
      type: 'GET',
      url: `/api/get_project_detail/?pk=${pk}`,
      success: function (response) {

        window.sa_d_list = response.sa_d_list;
  
        var $selectf = $("#select-folder").selectize({
          valueField: "folder_name",
          searchField: "folder_name",
          options: response.folder_list,
          render: {
            option: function (data, escape) {
              return '<div class="option">' + '<span class="folder_name">' + escape(data.folder_name) + "</span>" + '<br><span class="last_updated">最後更新：' + escape(data.folder_last_updated) + "</span>" + "</div>";
            },
            item: function (data, escape) {
              return '<div class="option">' + '<span class="folder_name">' + escape(data.folder_name) + "</span>" + "</div>";
            },
          },
          });
          
          // select folder from url
          $selectf[0].selectize.setValue($('input[name=get-folder]'));

  
          /* sub studyarea */
          /// TODO 這邊要補齊
          let sa_html = '';
          for (i = 0; i < response.study_area.length; i++) {
            sa_html = `
                <li>
                      <label class="form-check-label">
                          <input class="filter" type="radio" name="sa-filter" value="${ response.study_area[i].id }"  data-parent="${ response.study_area[i].parent_id }" id="${ response.study_area[i].id }" data-bs-toggle="collapse"
                                 href="#collapse_s_${ response.study_area[i].id }" role="button" aria-expanded="false" aria-controls="collapse_s_${ response.study_area[i].id }">
                              - ${ response.study_area[i].name }
                      </label>
                  </li>
                  <div class="collapse collapse-s" id="collapse_s_${ response.study_area[i].id }">`
            if (response.study_area[i].deployment_set.length > 0) {
                sa_html += `                  <li>
                <label class="form-check-label w-auto">
                    <input class="filter all" type="checkbox" name="d-filter" value="all" data-parent-radio="${ response.study_area[i].id }">
                        全部
                </label>
                </li>`
                for (j = 0; j < response.study_area[i]['deployment_set'].length; j++) {
                    sa_html += `
                    <li>
                    <label class="form-check-label w-100">
                        <input class="filter" type="checkbox" name="d-filter" value="${ response.study_area[i]['deployment_set'][j]['id'] }" data-parent-radio="${ response.study_area[i].id }">
                            ${ response.study_area[i]['deployment_set'][j]['name'] }
                    </label>
                    </li>`
                }

            }
            sa_html += `</div>`

            $(`#collapse_${ response.study_area[i].parent_id }`).append(sa_html)

          }



          // date slider
          if(response.earliest_date) {
            $("#date-slider").slider({
                range: true,
                min: new Date(response.earliest_date).getTime() / 1000,
                max: new Date(response.latest_date).getTime() / 1000,
                step: 86400,
                values: [ new Date(response.earliest_date).getTime() / 1000, new Date(response.latest_date).getTime() / 1000 ],
                slide: function( event, ui ) {
                $('#date-content').html((new Date(ui.values[ 0 ] *1000).toISOString().substring(0, 10)) + "至" +
                (new Date(ui.values[1]*1000)).toISOString().substring(0, 10))
                },
            });
            $("#date-content").html((new Date($("#date-slider").slider("values",0)*1000).toISOString().substring(0, 10)) + "至" +
            (new Date($("#date-slider").slider("values",1)*1000)).toISOString().substring(0, 10));
        
            window.conditions = {
                times : $("input[name=times]").val(),
                pk : pk,
                species : $('input[name="species-filter"]:checked').map(function(){return $(this).val();}).get(),
                sa :  $("input[name=sa-filter]:checked").val(),
                start_date : (new Date($("#date-slider").slider("values",0)*1000)).toISOString().substring(0, 10),
                end_date : (new Date($("#date-slider").slider("values",1)*1000)).toISOString().substring(0, 10),
                deployment : $('input[name="d-filter"]:checked').map(function(){return $(this).val();}).get(),
                folder_name : $('#select-folder option:selected').val(),
              }
    
        } else {
            window.conditions = {
                times : $("input[name=times]").val(),
                pk : pk,
                species : $('input[name="species-filter"]:checked').map(function(){return $(this).val();}).get(),
                sa :  $("input[name=sa-filter]:checked").val(),
                deployment : $('input[name="d-filter"]:checked').map(function(){return $(this).val();}).get(),
                folder_name : $('#select-folder option:selected').val(),
              }

        }

          // initalize datatable & redraw table
          let table = $('#img-table').DataTable({
              dom:"<'row px-3 pt-3 text-end'<'col-6'B><'col-6'l>>" +
                  "<'row'<'col-sm-12'tr>>" +
                  "<'row p-3'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
              language: language_settings,
              ordering: false,
              processing: true,
              serverSide: true,
              searching: false,
              scrollY: 100,
              scrollResize: true,
              scrollX: true,
              scrollCollapse: true,
              filter: false,
              buttons: [
                {
                    text: '編輯',
                    className: 'btn btn-outline-success btn-sm e-button d-none disabled',
                    action: function ( e, dt, node, config ) {
  
                      let img_array = []
                      let imguuid_array = []
                      let sa_array = []
                      let dep_array = []
                      let species_array = []
                      let sex_array = []
                      let life_stage_array = []
                      let antler_array = []
                      let animal_id_array = []
                      let remarks_array = []
                      $( "input.edit-checkbox:checked").not('#edit-all').each(function(  ) {
                        if(!$(this).parent().hasClass("dataTables_sizing")){
                          current_row = table.row($(this).parent()).data();
                          img_array.push(current_row['image_id'])
                          imguuid_array.push(current_row['image_uuid'])
                          sa_array.push(current_row['saname'])
                          dep_array.push(current_row['dname'])
                          species_array.push(current_row['species'])
                          sex_array.push(current_row['sex'])
                          life_stage_array.push(current_row['life_stage'])
                          antler_array.push(current_row['antler'])
                          animal_id_array.push(current_row['animal_id'])
                          remarks_array.push(current_row['remarks'])
                          
                          if (img_array.length > 1 ) { // TODO 或是直接按row
                            $('.edit-prev, .edit-next').addClass('d-none');
                            $('#editModal').off('keydown');  
                          } else {
                            $('.edit-prev, .edit-next').removeClass('d-none');
                            // 切換上下張的功能
                            let c_row = $(this).parent()
                            let idx = table.column(c_row).index();              
                            changeEditContent(c_row.parent(), idx);
                          }
                        }
                      });  
  
                        $('#edit-image_id').val(img_array)                  
                        // remove notice info
                        $('#edit-studyarea, #edit-deployment, #edit-project').removeClass('notice-border')
                        $('.notice').addClass('d-none');
                        // clean studyarea & deployment id
                        $('#edit-studyarea_id').val('')
                        $('#edit-deployment_id').val('')
  
                        $('#edit-project').val($('input[name=project-name]').val());
                        $('#edit-project_id').val(pk);
                        $sa.autocomplete('option', 'source', response.sa_list);
  
                       if (allEqual(sa_array)){
                          $('#edit-studyarea').val(sa_array[0])
                          $dep.autocomplete('option', 'source', response.sa_d_list[current_row['saname']]);
                        } else {
                          $('#edit-studyarea').val('')
                          $dep.autocomplete('option', 'source', '');
                        }                      
                        allEqual(dep_array) ? $('#edit-deployment').val(dep_array[0]) : $('#edit-deployment').val('');
                        allEqual(species_array) ? $('#edit-species').val(species_array[0]) : $('#edit-species').val('');
                        allEqual(life_stage_array) ? $('#edit-life_stage').val(life_stage_array[0]) : $('#edit-life_stage').val('');
                        allEqual(sex_array) ? $('#edit-sex').val(sex_array[0]) : $('#edit-sex').val('');
                        allEqual(antler_array) ? $('#edit-antler').val(antler_array[0]) : $('#edit-antler').val('');
                        allEqual(animal_id_array) ? $('#edit-animal_id').val(animal_id_array[0]) : $('#edit-animal_id').val('');
                        allEqual(remarks_array) ? $('#edit-remarks').val(remarks_array[0]) : $('#edit-remarks').val('');
  
                        // image or videos
                        if (allEqual(imguuid_array)){
                          $('#edit-filename').html(current_row['filename'])
                          $('#edit-datetime').html(current_row['datetime'])  
                          $('#edit-image').html(current_row['file_url'])
                        } else {
                          $('#edit-filename').html('')
                          $('#edit-datetime').html('')  
                          $('#edit-image').html('')
                        }
  
                        $('#edit-image .img').attr('src', $('#edit-image .img').data('src')).addClass('w-100').addClass('h-auto');
                        $('#edit-image video').addClass('w-100');
                        $('#edit-image video').addClass('h-auto');
                        $('#edit-image video source').on('error',function(event) {
                          $(this).parent().parent().html('<p align="center" class="cannot-load">無法載入</p>')
                        })
                        $('#edit-image video source, #edit-image img').on('error',function(event) {
                          $(this).parent().html('<p align="center" class="cannot-load">無法載入</p>')
                        })  
                        
                        $('#editModal').modal('show');
  
                        // disable edit
                        let editable = response.editable;
                        if ((editable!=true)||($('#edit_button').data('edit')=='off')){
                          $('.edit-content input').attr('disabled', 'disabled')
                          $('.edit-footer').addClass('d-none')
                        } else {
                          $('.edit-content input').prop("disabled", false)
                          $('.edit-footer').removeClass('d-none')
                        }
                      }  
                },
                {
                  text: '刪除',
                  className: 'btn btn-outline-secondary btn-sm d-button d-none disabled',
                  action: function ( e, dt, node, config ) {
                      $('#deleteModal').modal('show')
                  }
                }
              ],
              ajax: {
                  type: "POST",
                  dataType : 'json',        
                  url: "/api/data",
                  headers:{'X-CSRFToken':$csrf_token},
                  data: function ( d ) {
                    d.times = window.conditions.times;
                    d.pk = pk;
                    d.species = window.conditions.species;
                    d.sa =  window.conditions.sa;
                    d.start_date = window.conditions.start_date;
                    d.end_date = window.conditions.end_date;
                    d.deployment = window.conditions.deployment;
                    d.folder_name = window.conditions.folder_name;
                    d.orderby = $('.orderby svg.sort-icon-active').data('orderby');
                    d.sort = $('.orderby svg.sort-icon-active').data('sort');
                  },
                  error: function(){
                    $('.dataTables_processing').hide()
                    alert('未知錯誤，請聯繫管理員');
                  }
              },
              order: [[0, "asc"]],
              drawCallback: function(){
                  $('.dataTables_processing').hide()
                  // button style
                  var btns = $('.dt-button');
                  btns.removeClass('dt-button');
  
                  // uncheck select all button
                  $('#edit-all').prop('checked', false)
  
                  $('.e-button, .d-button').addClass('disabled')
                  // bind onclick event
                  $('input[name="edit"]').on('click', function(){
                    if ($("input[name='edit']").is(":checked")){
                      $('.e-button, .d-button').removeClass('disabled')
                    } else {
                      $('.e-button, .d-button').addClass('disabled')
                    }
                  })
                  // remove last page button
                  //$("a[data-dt-idx=7]").remove()
  
                  // lazy loading for images
                  var watcher = new IntersectionObserver(onEnterView);
                  var lazyImages = document.querySelectorAll("img.lazy");
                  for (let image of lazyImages) {
                      watcher.observe(image); // 開始監視
                  }
                  function onEnterView(entries, observer) {
                      for (let entry of entries) {
                          if (entry.isIntersecting) {
                              var img = entry.target;
                              img.setAttribute("src", img.dataset.src);
                              observer.unobserve(img);
                          }
                      }
                  }
  
                  // lazy loading for videos
                  var watcher2 = new IntersectionObserver(onEnterView2);
                  var lazyVideos = document.querySelectorAll("video");
                  for (let v of lazyVideos) {
                      watcher2.observe(v); // 開始監視
                      v.removeAttribute('controls');
                  }
                  function onEnterView2(entries, observer) {
                      for (let entry of entries) {
                          if (entry.isIntersecting) {
                              var video = entry.target;
                              video.setAttribute("preload", "");
                              observer.unobserve(video);
                          }
                      }
                  }
  
                  // event listener for loading video & img
                  $('img').on('error',function(event) {
                    $(this).parent().html('<p align="center" class="cannot-load">無法載入</p>')
                  })
  
                  $('video source').on('error',function(event) {
                    $(this).parent().parent().html('<p align="center" class="cannot-load">無法載入</p>')
                  })
  
                  // adjust columns after 1000 ms

                  setTimeout(function(){
                      $.fn.dataTable.tables( { visible: false, api: true } ).columns.adjust();
                  }, 1000);
              },
              columns: [
                          {data: "edit"},
                          {data: "saname"},
                          {data: "dname"},
                          {data: "filename" },
                          {data: "datetime"},
                          {data: "species"},
                          {data: "life_stage"},
                          {data: "sex"},
                          {data: "antler"},
                          {data: "animal_id"},
                          {data: "remarks"},
                          {data: "file_url"},
                          {data: "image_uuid"},
                          {data: "image_id"},
                      ],
              columnDefs: [
                  {
                      "targets": [ 0, 12,13 ], // hidden columns
                      "visible": false
                  }
              ],
          });


        $('.orderby').on('click',function(){
          if ($(this).children('svg').hasClass('fa-sort')){
              $('.orderby:not(this)').children('svg').removeClass('fa-sort-down fa-sort-up sort-icon-active sort-icon').addClass('fa-sort sort-icon');
              $(this).children('svg').removeClass('fa-sort sort-icon-active sort-icon').addClass('fa-sort-down sort-icon-active');
              $(this).children('svg').data('sort','asc');
          } else if ($(this).children('svg').hasClass('fa-sort-down')) {
              $('.orderby:not(this)').children('svg').removeClass('fa-sort-down fa-sort-up sort-icon-active sort-icon').addClass('fa-sort sort-icon');
              $(this).children('svg').removeClass('fa-sort sort-icon-active sort-icon').addClass('fa-sort-up sort-icon-active')
              $(this).children('svg').data('sort','desc');
          } else {
              $('.orderby:not(this)').children('svg').removeClass('fa-sort-down fa-sort-up sort-icon-active sort-icon').addClass('fa-sort sort-icon');
              $(this).children('svg').removeClass('fa-sort sort-icon-active sort-icon').addClass('fa-sort-down sort-icon-active')
              $(this).children('svg').data('sort','asc');
          }

          table.draw();
          //getRecordByURL(queryString,null,response.limit,$(this).data('orderby'),$(this).data('sort'))
        })
  
          // edit
          $('#edit_button').on('click', function(){
            if ($('#edit_button').data('edit') == 'off'){
              $('#edit_button').data('edit','on');
              $($.fn.dataTable.tables( true ) ).DataTable().column( 0 ).visible(true);
              $('#edit_button').html('<i class="fa fa-xs fa-pencil w-12"></i> 結束編輯')
              // show buttons
              $('.d-button, .e-button').removeClass('d-none')
              // bind onclick event
              $('input[name="edit"]').on('click', function(){
                if ($("input[name='edit']").is(":checked")){
                  $('.e-button, .d-button').removeClass('disabled')
                } else {
                  $('.e-button, .d-button').addClass('disabled')
                }
              })
            } else {
              $('#edit_button').data('edit','off');
              // uncheck all
              $($.fn.dataTable.tables( true ) ).DataTable().column( 0 ).visible(false);
              $('#edit_button').html('<i class="fa fa-xs fa-pencil w-12"></i> 編輯模式')
              $('.d-button, .e-button').addClass('d-none')
            }
            // adjust columns after 1000 ms
            setTimeout(function(){
              $.fn.dataTable.tables( { visible: false, api: true } ).columns.adjust();
          }, 1000);
          })
  
  
          $('.clear').on('click', function() {
              $('input[type=radio]').prop('checked', false);
              $('input[type=radio].all').prop('checked', true);
              $('input[type=checkbox].filter').prop('checked', false);
              // radio
              $('.fa-check').remove()
              $('<i class="fas fa-check title-dark w-12"></i>').insertBefore($("input[type=radio].all"))
  
              if (response.earliest_date) {
                    $("#date-slider").slider({
                    range: true,
                    min: new Date(response.earliest_date).getTime() / 1000,
                    max: new Date(response.latest_date).getTime() / 1000,
                    step: 86400,
                    values: [ new Date(response.earliest_date).getTime() / 1000, new Date(response.latest_date).getTime() / 1000 ],
                    slide: function( event, ui ) {
                        $('#date-content').html((new Date(ui.values[ 0 ] *1000).toISOString().substring(0, 10)) + "至" +
                        (new Date(ui.values[1]*1000)).toISOString().substring(0, 10))
                    },
                    });
                    $("#date-content").html((new Date($("#date-slider").slider("values",0)*1000).toISOString().substring(0, 10)) + "至" +
                    (new Date($("#date-slider").slider("values",1)*1000)).toISOString().substring(0, 10));
                }
  
              // folder
              $selectf[0].selectize.setValue('');
              // 拍攝時間
              $("input[name=times]").val('')
          });
  
  
  
  
          function changeEditContent(current_row, idx){         
              // remove notice info
              $('#edit-studyarea, #edit-deployment, #edit-project').removeClass('notice-border')
              $('.notice').addClass('d-none');
              // clean studyarea & deployment id
              $('#edit-studyarea_id').val('')
              $('#edit-deployment_id').val('')
  
              let row = table.row(current_row).data();
              $('.edit-next').unbind('click');
              $('.edit-next').on('click', function(){
                if (current_row.next().length!=0){
                  changeEditContent(current_row.next(), idx);
                } else {
                  $('#img-table_next').trigger('click');
                  var table = $('#img-table').DataTable();
                    // 等到table畫好再換, 預設第一個
                    table.on( 'draw', function () {
                      let change_row = $('#img-table tr').eq(1);
                      changeEditContent(change_row, idx);
                    });
                }
              })
  
              $('.edit-prev').unbind('click');
              $('.edit-prev').on('click', function(){
                if (current_row.prev().length!=0){
                  changeEditContent(current_row.prev(), idx);
                } else {
                  $('#img-table_previous').trigger('click');
                  var table = $('#img-table').DataTable();
                    // 等到table畫好再換, 預設最後一個
                    table.on( 'draw', function () {
                      let change_row = $('#img-table tr:last');
                      changeEditContent(change_row, idx);
                    });
                }
              })
  
              $('#editModal').off('keydown');        
              $('#editModal').keydown(function (e) {
                var arrow = { left: 37, right: 39};
                switch (e.which) {
                  case arrow.left:
                  if (current_row.prev().length!=0){
                    changeEditContent(current_row.prev(), idx);
                  } else {
                    
                    $('#img-table_previous').trigger('click');
                    var table = $('#img-table').DataTable();
                      // 等到table畫好再換, 預設最後一個
                      table.on( 'draw', function () {
                        let change_row = $('#img-table tr:last');
                        changeEditContent(change_row, idx);
                      });
                  }
                    break;
                  case arrow.right:
                    if (current_row.next().length!=0){
                      changeEditContent(current_row.next(), idx);
                    } else {
                      $('#img-table_next').trigger('click');
                      var table = $('#img-table').DataTable();
                        // 等到table畫好再換, 預設第一個
                        table.on( 'draw', function () {
                          let change_row = $('#img-table tr').eq(1);
                          changeEditContent(change_row, idx);
                        });
                    }
                    break;
                }
              });
                  $('#edit-project').val($('input[name=project-name]').val())
                  $('#edit-project_id').val(pk)
                  $sa.autocomplete('option', 'source', response.sa_list);
                  $dep.autocomplete('option', 'source', response.sa_d_list[row['saname']]);
                  $('#edit-studyarea').val(row['saname'])
                  $('#edit-deployment').val(row['dname'])
                  $('#edit-filename').html(row['filename'])
                  $('#edit-datetime').html(row['datetime'])
                  //$('#edit-datetime').val(row['datetime'].replace(' ','T'))
                  $('#edit-species').val(row['species'])
                  $('#edit-life_stage').val(row['life_stage'])
                  $('#edit-sex').val(row['sex'])
                  $('#edit-antler').val(row['antler'])
                  $('#edit-animal_id').val(row['animal_id'])
                  $('#edit-remarks').val(row['remarks'])
                  $('#edit-image_uuid').val(row['image_uuid'])
                  $('#edit-image_id').val(row['image_id'])
                  $('#edit-image').html(row['file_url'])
                  $('#edit-image .img').attr('src', $('#edit-image .img').data('src')).addClass('w-100').addClass('h-auto');
                  $('#edit-image video').addClass('w-100');
                  $('#edit-image video').addClass('h-auto');
                  $('#edit-image video source').on('error',function(event) {
                    $(this).parent().parent().html('<p class="cannot-load" align="center">無法載入</p>')
                  })
                  $('#edit-image video source, #edit-image img').on('error',function(event) {
                    $(this).parent().html('<p class="cannot-load" align="center">無法載入</p>')
                  })
  
                /*if (idx != 0){
                    $('#editModal').modal('show');
                  // disable edit
                } */
  
                  let editable = response.editable;
                  if ((editable!=true)||($('#edit_button').data('edit')=='off')){
                    $('.edit-content input').attr('disabled', 'disabled')
                    $('.edit-footer').addClass('d-none')
                  } else {
                    $('.edit-content input').prop("disabled", false)
                    $('.edit-footer').removeClass('d-none')
                  }


                  $('.edit-xx').on('click', function(){
                    $('#editModal').modal('hide')
                  })

          }
  
  
          // ---------------------------------- //
  
          // set permission: 計畫總管理人/個別計畫承辦人/系統管理員
          $('#img-table tbody').on('click', 'td', function () {
            let current_row = $(this);
            let idx = table.column(current_row).index();
  
            changeEditContent(current_row.parent(), idx);
            $('.edit-prev, .edit-next').removeClass('d-none');

            if (idx!=0){
              $('#editModal').modal('show')
            }
  
          });
  
  
          $('#editModal').on('hidden.bs.modal', function () {
            // remove next & prev event after modal close
            $(this).off('keydown');        
          })
          
  
          // ---------------------------------- //
  
            $('.edit-submit').on('click', function() {
                // 紀錄原本在什麼folder
                let selected_folder = $('#select-folder option:selected').val();
  
                let checked = true
                // project
                if (!$('#edit-project').val()){
                  checked = false
                  $('#edit-project').parent().next('.notice').removeClass('d-none')
                  $('#edit-project').addClass('notice-border')
                }
                
                // studyarea
                if (!$('#edit-studyarea').val()){
                  checked = false
                  $('#edit-studyarea').parent().next('.notice').removeClass('d-none')
                  $('#edit-studyarea').addClass('notice-border')
                }
                // deployment
                if (!$('#edit-deployment').val()){
                  checked = false
                  $('#edit-deployment').parent().next('.notice').removeClass('d-none')
                  $('#edit-deployment').addClass('notice-border')
                }
                // datetime
                /*
                if (!$('input[name=datetime]').val()){
                  checked = false
                  $('input[name=datetime]').next('.notice').removeClass('d-none')
                  $('input[name=datetime]').addClass('notice-border')
                }*/
                if (checked){
                  $.ajax({
                      data: $('#editForm').serialize(),
                      type: "POST",
                      url: "/api/edit_image/" + pk,
                      success: function(data) {
                          $('#editModal').modal('hide');
                          // 修改folder
                          $selectf[0].selectize.clear();
                          $selectf[0].selectize.clearOptions();
                          $selectf[0].selectize.addOption(data.folder_list);
                          // 要重新選擇 如果原本的folder還在就選，不在就清空
                          for (let i = 0; i < data.folder_list.length; i++) {
                            if (data.folder_list[i]['folder_name'] == selected_folder) {
                              $selectf[0].selectize.setValue(selected_folder);
                            }
                           }
  
                          table.draw(false); // stay in same page
                          // update filter //
                          let current_species = $("input[name=species-filter]:checked")
                          $('#species-list-all').nextAll('li').remove();
                          for (let i = 0; i < data['species'].length; i++) {
                           $('#species-list').append(
                              `<li>
                              <label class="form-check-label">
                              <input class="filter" type="checkbox" name="species-filter" value="${data['species'][i]['name']}" checked>
                                  ${data['species'][i]['name']} (${data['species'][i]['count']})
                              </label>
                              </li>`)
                          }
                          if ($("input[name=species-filter].all").is(':checked')){
                            $("#species-list li label").children('svg').remove()
                            $("#species-list li label").prepend('<i class="fas fa-check title-dark w-12"></i>')
                            $("input[name='species-filter']").prop('checked', true)
                          } else {
                            $("#species-list li label").children('svg').remove()
                            $(`input[name=species-filter]`).prop("checked",false);
                            current_species.each(function(){
                              $('<i class="fas fa-check title-dark w-12"></i>').insertBefore($(`input[name=species-filter][value="${this.value}"]`));
                              $(`input[name=species-filter][value="${this.value}"]`).prop("checked",true);
                            })
                          }
                      // bind click function
                      // species: if other checkbox checked, uncheck 'all'
                      $("input[name='species-filter'].filter:not(.all)").unbind('click');
                      $("input[name='species-filter'].filter:not(.all)").click (function(){
                        $("#species-list-all label").children('svg').remove()
                        // 先移除自己本身的再判斷
                        $(this).prev('svg').remove()
                        if( $(this).is(':checked') ) {
                            $('<i class="fas fa-check title-dark w-12"></i>').insertBefore($(this));
                        } 
                        $("input[name='species-filter'].all").prop('checked', false)
                      })
      
                      // species: if 'all' checked, check all checkbox
                      $("input[name='species-filter'].all").unbind('click');
                      $("input[name='species-filter'].all").click (function(){
                          // 先移除掉全部的再一次加上去
                          $("#species-list li label").children('svg').remove()
                          if( $(this).is(':checked') ) {
                              $("#species-list li label").prepend('<i class="fas fa-check title-dark w-12"></i>')
                              $("input[name='species-filter']").prop('checked', true)
                          } else {
                              $("input[name='species-filter']").prop('checked', false)
                          }
                      })
  
  
                  },
                  error:function(){
                    alert('未知錯誤，請聯繫管理員');
                  }
                })
                }
              });
  
          // radio style for studyarea & cameralocation
          $("input[name=sa-filter]").click( function () {
              $(`input[type=checkbox][name=d-filter].filter`).prop('checked', false);
              let radio_group = $(`input[name=sa-filter]:checked`).val();
              if (radio_group){
                  $(`input[data-parent-radio=${radio_group}]`).prop('checked', true);
                  }
              $(`input[name=sa-filter]`).parent('label').children('svg').remove()
              $('<i class="fas fa-check title-dark w-12"></i>').insertBefore($(`input[name=sa-filter]:checked`));
          });
  
          // radio style for studyarea & cameralocation: checkbox toggle
          $("input[type=checkbox][name=d-filter].filter.all").click (function(){
              let parent_radio = $(this).data('parent-radio')
  
              // uncheck other checkbox group
              $(`input[type=checkbox][name=d-filter]:not([data-parent-radio=${parent_radio}])`).prop('checked', false)
  
              if( $(this).is(':checked') ) {
                  $(`input[data-parent-radio=${parent_radio}][type=checkbox]`).prop('checked', true)
              } else {
                  $(`input[data-parent-radio=${parent_radio}][type=checkbox]`).prop('checked', false)
              }
              // radio
              $(`input[name=sa-filter]`).parent('label').children('svg').remove()
              $(`input[name=sa-filter]:checked`).prop('checked', false)
              $(`input[name=sa-filter][id=${parent_radio}]`).prop('checked', true)
              $('<i class="fas fa-check title-dark w-12"></i>').insertBefore($(`input[name=sa-filter][id=${parent_radio}]`));
          })
  
          // deployment: if other checkbox checked, uncheck 'all'
          $("input[type=checkbox][name=d-filter].filter:not(.all)").click (function(){
              let parent_radio = $(this).data('parent-radio')
              // uncheck other checkbox group
              $(`input[type=checkbox][name=d-filter]:not([data-parent-radio=${parent_radio}])`).prop('checked', false)
              // uncheck all
              $(`input[data-parent-radio=${parent_radio}][type=checkbox].all`).prop('checked', false)
              // radio
              $(`input[name=sa-filter]`).parent('label').children('svg').remove()
              $(`input[name=sa-filter]:checked`).prop('checked', false)
              $(`input[name=sa-filter][id=${parent_radio}]`).prop('checked', true)
              $('<i class="fas fa-check title-dark w-12"></i>').insertBefore($(`input[name=sa-filter][id=${parent_radio}]`));
          })
  
          $("input[name='species-filter'].filter:not(.all)").click (function(){
  
            $("#species-list-all label").children('svg').remove()
            // 先移除自己本身的再判斷
            $(this).prev('svg').remove()
            if( $(this).is(':checked') ) {
                $('<i class="fas fa-check title-dark w-12"></i>').insertBefore($(this));
            } 
            $("input[name='species-filter'].all").prop('checked', false)
        })
  
          // species: if 'all' checked, check all checkbox
  
          $("input[name='species-filter'].all").click (function(){
              if( $(this).is(':checked') ) {
                  // 先移除掉全部的再一次加上去
                  $("#species-list li label").children('svg').remove()
                  $("#species-list li label").prepend('<i class="fas fa-check title-dark w-12"></i>')
                  $("input[name='species-filter']").prop('checked', true)
              } else {
                  $("#species-list li label").children('svg').remove()
                  $("input[name='species-filter']").prop('checked', false)
              }
          })
  
          $('#deleteData').on('click', function() {
  
            checkedvalue = [];
            $("input[name=edit]").not('#edit-all').each(function () {
                if ($(this).is(":checked")) {
                    if (!isNaN($(this).val())){
                    checkedvalue.push($(this).val());
                    }
                }
            });
            $('#deleteModal').modal('hide')
            // ajax to delete data
            $.ajax({
              data: {'image_id': checkedvalue},
              headers:{'X-CSRFToken': $csrf_token},
              type: "POST",
              url: "/delete/" + pk + '/',
              success: function(data){
                
                table.draw(false); // stay in same page
                // update filter //
                let current_species = $("input[name=species-filter]:checked")
                $('#species-list-all').nextAll('li').remove();
                for (let i = 0; i < data['species'].length; i++) {
                 $('#species-list').append(
                    `<li>
                    <label class="form-check-label">
                    <input class="filter" type="checkbox" name="species-filter" value="${data['species'][i]['name']}" checked>
                        ${data['species'][i]['name']} (${data['species'][i]['count']})
                    </label>
                    </li>`)
                }
                if ($("input[name=species-filter].all").is(':checked')){
                  $("#species-list li label").children('svg').remove()
                  $("#species-list li label").prepend('<i class="fas fa-check title-dark w-12"></i>')
                  $("input[name='species-filter']").prop('checked', true)
                } else {
                  $("#species-list li label").children('svg').remove()
                  $(`input[name=species-filter]`).prop("checked",false);
                  current_species.each(function(){
                    $('<i class="fas fa-check title-dark w-12"></i>').insertBefore($(`input[name=species-filter][value="${this.value}"]`));
                    $(`input[name=species-filter][value="${this.value}"]`).prop("checked",true);
                  })
                }
              // bind click function
              // species: if other checkbox checked, uncheck 'all'
              $("input[name='species-filter'].filter:not(.all)").click (function(){
                $("#species-list-all label").children('svg').remove()
                // 先移除自己本身的再判斷
                $(this).prev('svg').remove()
                if( $(this).is(':checked') ) {
                    $('<i class="fas fa-check title-dark w-12"></i>').insertBefore($(this));
                } 
                $("input[name='species-filter'].all").prop('checked', false)
              })
  
              // species: if 'all' checked, check all checkbox
              $("input[name='species-filter'].all").click (function(){
                  // 先移除掉全部的再一次加上去
                  $("#species-list li label").children('svg').remove()
                  if( $(this).is(':checked') ) {
                      $("#species-list li label").prepend('<i class="fas fa-check title-dark w-12"></i>')
                      $("input[name='species-filter']").prop('checked', true)
                  } else {
                      $("input[name='species-filter']").prop('checked', false)
                  }
              })
  
            },
            error:function(){
                alert('未知錯誤，請聯繫管理員');
            }
            })
          })
  
  
          // download
          $('.download').on('click', function(){
            if (response.earliest_date) {
                $("input[name=start_date]").val((new Date($("#date-slider").slider("values",0)*1000)).toISOString().substring(0, 10));
                $("input[name=end_date]").val((new Date($("#date-slider").slider("values",1)*1000)).toISOString().substring(0, 10));
            }
            $("input[name=email]").val($("#download-email").val())
            $.ajax({
                    data: $('#downloadForm').serialize(),
                    type: "POST",
                    url: "/download/" + pk,
                    success: function(){
                        alert('請求已送出');
                        $('#downloadModal').modal('hide')
                    },
                    error:function(){
                        alert('未知錯誤，請聯繫管理員');
                        $('#downloadModal').modal('hide')
                    }
                  })
          })




      // autocomplete
      $( "#edit-project" ).autocomplete({
        minLength: 0,
        source: response.projects,
        change: function(event,ui){
          $( "#edit-project" ).val((ui.item ? ui.item.label : ""));
          $( "#edit-project_id" ).val((ui.item ? ui.item.value : ""));
  
          // only allow studyarea in the list
          /*
          $( "#edit-studyarea" ).val((ui.item ? ui.item.label : ""));
          $( "#edit-studyarea_id" ).val((ui.item ? ui.item.value : ""));
          if ($( "#edit-studyarea" ).val()==''){
            $('#edit-deployment, #edit-deployment_id').val('')
            $dep.autocomplete('option', 'source', '');
          } */
  
          if ($( "#edit-project" ).val()==''){
            $('#edit-deployment, #edit-deployment_id, #edit-studyarea, #edit-studyarea_id').val('')
            $sa.autocomplete('option', 'source', '');
            $dep.autocomplete('option', 'source', '');
          } 
        },      
        select: function( event, ui ) {
          $( "#edit-project_id" ).val( ui.item.value );
          $( "#edit-project" ).val( ui.item.label )
  
  
            $.ajax({
              data: {'pk': $( "#edit-project_id" ).val()},
              type: "POST",
              url: "/update_edit_autocomplete",
              headers:{'X-CSRFToken': $csrf_token},
              success: function(data) {
                // 修改studyarea & deployment
                $sa.autocomplete('option', 'source', data.sa_list);
                $dep.autocomplete('option', 'source', '');
                window.sa_d_list = data.sa_d_list;
                $('#edit-deployment, #edit-deployment_id, #edit-studyarea, #edit-studyarea_id').val('')
              },
              error:function(){
                alert('未知錯誤，請聯繫管理員');
              }
            })
          
          return false;
        }
      }).focus(function () {
        $(this).autocomplete("search", "");
      }).val($('input[name=project-name]').val())
  
  
  
      // dependent dropdown menu
      var $dep = $("#edit-deployment").autocomplete({
        source: [],
        minLength: 0,
        change: function(event,ui){
          // only allow deployments in the list
          $(this).val((ui.item ? ui.item.label : ""));
          $( "#edit-deployment_id" ).val((ui.item ? ui.item.value : ""));
        },      
        select: function( event, ui ) {
            $( "#edit-deployment" ).val( ui.item.label );
            $( "#edit-deployment_id" ).val( ui.item.value );
            return false;
        }
      }).focus(function () {
        $(this).autocomplete("search", "");
      });
  
      $sa = $( "#edit-studyarea" ).autocomplete({
        minLength: 0,
        source: response.sa_list,
        open: function( event, ui ) {
          window.pre_select = $('#edit-studyarea').val();
        },
        change: function(event,ui){
          // only allow studyarea in the list
          $( "#edit-studyarea" ).val((ui.item ? ui.item.label : ""));
          $( "#edit-studyarea_id" ).val((ui.item ? ui.item.value : ""));
          if ($( "#edit-studyarea" ).val()==''){
            $('#edit-deployment, #edit-deployment_id').val('')
            $dep.autocomplete('option', 'source', '');
          } 
        },      
        select: function( event, ui ) {
            $( "#edit-studyarea_id" ).val( ui.item.value );
            $( "#edit-studyarea" ).val( ui.item.label )
            if (pre_select != ui.item.label) {
              $('#edit-deployment, #edit-deployment_id').val('')
            }
            var src = ui.item.label;
            // 這邊會跟著改
            $dep.autocomplete('option', 'source', window.sa_d_list[src]);
            return false;
        }
      }).focus(function () {
        $(this).autocomplete("search", "");
      })
  
  


      }



  
      });
    


      $('#edit-all').on('click',function(){
        if($('#edit-all').is(':checked')) {
            $('.edit-checkbox').prop('checked', true)
          } else {
              $('.edit-checkbox').each(function() {
                $('.edit-checkbox').prop('checked', false)
              });
          }
      })
  




      var species = ['水鹿','山羌','獼猴','山羊','野豬','鼬獾','白鼻心','食蟹獴','松鼠','飛鼠','黃喉貂','黃鼠狼','小黃鼠狼','麝香貓','黑熊','石虎','穿山甲','梅花鹿','野兔','蝙蝠', '無法辨識', '空拍', '工作照', '測試', '台灣山鷓鴣', '台灣竹雞', '黑長尾雉', '藍腹鷴', '黑冠麻鷺', '環頸雉', '山鷸', '灰林鴿', '金背鳩', '珠頸斑鳩', '翠翼鳩', '黃痣藪眉', '台灣噪眉', '台灣紫嘯鶇', '虎鶇', '白眉鶇', '白腹鶇', '赤腹鶇', '白頭鶇'].sort()
      var antler = ['初茸','茸角一尖','茸角一岔二尖','茸角二岔三尖','茸角三岔四尖','硬角一尖','硬角一岔二尖','硬角二岔三尖','硬角三岔四尖','解角']
      var sex = ['雄性','雌性','無法判定']
      var life_stage = ['成體','亞成體','幼體','無法判定']
  
      $('#edit-species').autocomplete({
          minLength: 0,
          source: function(request, response) {
              var data = $.grep(species, function(value) {
                  return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
              });
              response(data);
          }
          }).focus(function () {
              $(this).autocomplete("search", "");
      });
  
      $('#edit-antler').autocomplete({
          minLength: 0,
          source: function(request, response) {
              var data = $.grep(antler, function(value) {
                  return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
              });
              response(data);
          }
          }).focus(function () {
              $(this).autocomplete("search", "");
      });
  
      $('#edit-sex').autocomplete({
          minLength: 0,
          source: function(request, response) {
              var data = $.grep(sex, function(value) {
                  return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
              });
              response(data);
          }
          }).focus(function () {
              $(this).autocomplete("search", "");
      });
  
      $('#edit-life_stage').autocomplete({
          minLength: 0,
          source: function(request, response) {
              var data = $.grep(life_stage, function(value) {
                  return value.substring(0, request.term.length).toLowerCase() == request.term.toLowerCase();
              });
              response(data);
          }
          }).focus(function () {
              $(this).autocomplete("search", "");
      });


      $('#submitSelect').on('click', function(){
        window.conditions = {
            times : $("input[name=times]").val(),
            pk : $("input[name=pk]").val(),
            species : $('input[name="species-filter"]:checked').map(function(){return $(this).val();}).get(),
            sa :  $("input[name=sa-filter]:checked").val(),
            //{% if earliest_date != None %}
            start_date : (new Date($("#date-slider").slider("values",0)*1000)).toISOString().substring(0, 10),
            end_date : (new Date($("#date-slider").slider("values",1)*1000)).toISOString().substring(0, 10),
            //{% endif %}
            deployment : $('input[name="d-filter"]:checked').map(function(){return $(this).val();}).get(),
            folder_name : $('#select-folder option:selected').val(),
          }
          $('#img-table').DataTable().draw();
  
      })

  
      const allEqual = arr => arr.every( v => v === arr[0] )


      $( "#download-email" ).keyup(function() {
        ValidateEmail($(this).val())
      });
      






      });
  

      //https://emailregex.com

      function ValidateEmail(inputText){
        let mailformat = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
        if(inputText.match(mailformat)){
            $('#email-check').attr('fill', 'green');
            $('button.download').prop('disabled', false);
        } else {
            $('#email-check').attr('fill', 'lightgrey');
            $('button.download').prop('disabled', true);
        }
    }